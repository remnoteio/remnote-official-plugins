import {
  PluginCommandMenuLocation,
  PropertyType,
  ReactRNPlugin,
  RemId,
  declareIndexPlugin,
} from "@remnote/plugin-sdk";
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai";

const openAIKeySettingId = "openAIKey";

async function findFirstAsync<T>(
  array: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<T | undefined> {
  for (const item of array) {
    if (await predicate(item)) {
      return item;
    }
  }
  return undefined;
}

async function onActivate(plugin: ReactRNPlugin) {
  // console.log("onActivate", plugin.app);

  await plugin.settings.registerStringSetting({
    id: openAIKeySettingId,
    title: "OpenAI Key",
    description:
      "This plugin uses OpenAI's API (similar to ChatGPT). Go to https://platform.openai.com/account/api-keys and get your secret key.",
  });

  await plugin.app.registerMenuItem({
    id: "autofill",
    name: "AI Autofill",
    location: PluginCommandMenuLocation.PropertyConfigMenu,
    action: async (args: { rowIds: RemId[]; columnPropertyId: RemId }) => {
      const openAIKey: string | undefined = await plugin.settings.getSetting(
        openAIKeySettingId
      );

      if (!openAIKey) {
        plugin.app.toast(
          "Go to the Top Left Menu > Settings > Plugins Settings and add your OpenAI Key."
        );
      } else {
        const rows = (await plugin.rem.findMany(args.rowIds)) || [];
        const property = await plugin.rem.findOne(args.columnPropertyId);
        if (!property || rows.length === 0) return;

        const propertyText = await plugin.richText.toString(
          property.text ?? []
        );
        const propertyType = await property.getPropertyType();
        const propertyOptions = await property.getChildrenRem();
        const propertyOptionsText = await Promise.all(
          await propertyOptions.map(
            async (option) => await plugin.richText.toString(option.text ?? [])
          )
        );

        const tableName = await plugin.richText.toString(
          (await property?.getParentRem())?.text ?? []
        );

        const propertyTypePrompt =
          propertyType == PropertyType.CHECKBOX
            ? { type: "boolean" }
            : propertyType == PropertyType.NUMBER
            ? { type: "number" }
            : propertyType == PropertyType.SINGLE_SELECT
            ? { type: "string", enum: propertyOptionsText }
            : propertyType == PropertyType.MULTI_SELECT
            ? {
                type: "array",
                items: {
                  enum: propertyOptionsText,
                  type: "string",
                },
              }
            : { type: "string" };

        if (propertyText) {
          // try to find a row that already has a value
          // to use in the prompt to guide the AI

          const filledRow = await findFirstAsync(rows, async (row) => {
            const value = await row.getTagPropertyValue(args.columnPropertyId);
            return value ? !(await plugin.richText.empty(value)) : false;
          });
          const filledRowText = await plugin.richText.toString(
            filledRow?.text ?? []
          );
          const filledRowColumnValue = await filledRow?.getTagPropertyValue(
            args.columnPropertyId
          );
          const fakeCSV = `
name,${propertyText}
${filledRowText ? `${filledRowText},${filledRowColumnValue}` : ""}
`.trim();

          await Promise.all(
            rows.map(async (row) => {
              const currentValue = await row.getTagPropertyValue(
                args.columnPropertyId
              );

              if (await plugin.richText.empty(currentValue ?? [])) {
                const rowText = await plugin.richText.toString(row.text ?? []);
                if (!rowText.trim()) {
                  return;
                }

                const response = await promptAI(
                  openAIKey,
                  [
                    {
                      role: "system",
                      content: `Please complete the final row of the "${
                        tableName + ".csv"
                      }" CSV table:
${fakeCSV}
${rowText},`,
                    },
                  ],
                  [
                    {
                      name: "complete_row",
                      description: "Complete the final row of the CSV table.",
                      parameters: {
                        type: "object",
                        properties: {
                          [propertyText]: propertyTypePrompt,
                        },
                      },
                    },
                  ]
                );

                const value = response?.[propertyText];
                if (value) {
                  await row.setTagPropertyValue(args.columnPropertyId, [value]);
                } else {
                  await plugin.app.toast(
                    `No value returned by AI for row "${rowText}. Try providing one row with a value to guide the AI.`
                  );
                }
              }
            })
          );
        } else {
          plugin.app.toast("Give your column a name.");
        }
      }
    },
  });
}

async function promptAI(
  openAIKey: string,
  messages: ChatCompletionRequestMessage[],
  functions: ChatCompletionFunctions[]
): Promise<Record<string, any> | null> {
  const configuration = new Configuration({
    apiKey: openAIKey,
  });
  // circumvent unsafe header error
  delete configuration.baseOptions.headers["User-Agent"];
  const openai = new OpenAIApi(configuration);

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
    functions,
    function_call: {
      // forces the AI to use the function we defined
      name: "complete_row",
    },
  });

  console.log("openai messages", messages);

  const fnCall =
    chatCompletion?.data?.["choices"]?.[0]?.message?.["function_call"];

  try {
    return fnCall ? JSON.parse(fnCall?.["arguments"] || "") : null;
  } catch (e) {
    console.log("error", e);
    return null;
  }
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);

export function replaceAll(
  string: string,
  char: string | RegExp,
  replace: string
) {
  if (!string) return string;
  return string.split(char).join(replace);
}
