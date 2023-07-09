import {
  PluginCommandMenuLocation,
  PropertyType,
  ReactRNPlugin,
  RemId,
  declareIndexPlugin,
} from "@remnote/plugin-sdk";
import { Configuration, OpenAIApi } from "openai";

const openAIKeySettingId = "openAIKey";

async function onActivate(plugin: ReactRNPlugin) {
  console.log("onActivate", plugin.app);

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
        console.log("Args", args, openAIKey);
        const rows = (await plugin.rem.findMany(args.rowIds)) || [];

        const property = await plugin.rem.findOne(args.columnPropertyId);
        if (!property) return;

        const propertyText = await plugin.richText.toString(
          property?.text ?? []
        );

        const propertyType = await property.getPropertyType();

        const propertyOptions = await property.getChildrenRem();
        const propertyOptionsText = await Promise.all(
          await propertyOptions.map(
            async (option) => await plugin.richText.toString(option.text ?? [])
          )
        );

        const tableText = await plugin.richText.toString(
          (await property?.getParentRem())?.text ?? []
        );

        const propertyTypePrompt =
          propertyType == PropertyType.CHECKBOX
            ? "Rule: You MUST output only the single word Yes or No."
            : propertyType == PropertyType.NUMBER
            ? "Rule: You MUST output a number."
            : propertyType == PropertyType.SINGLE_SELECT ||
              propertyText == PropertyType.MULTI_SELECT
            ? "Rule: You MUST output only a single one of these options:" +
              propertyOptionsText
                .map((option) => "\n - " + replaceAll(option, ",", ""))
                .join(", ") +
              "\n"
            : "";

        console.log("propertyTypePrompt", propertyTypePrompt);

        if (propertyText) {
          await Promise.all(
            rows.map(async (row) => {
              const currentValue = await row.getTagPropertyValue(
                args.columnPropertyId
              );

              if (await plugin.richText.empty(currentValue ?? [])) {
                console.log("Row", row, row.text, property.text);
                const rowText = await plugin.richText.toString(row.text ?? []);

                const value = await promptAI(
                  openAIKey,
                  `
Your Goal: You're filling out a cell in a table.
Rule: Always try to guess something that seems relevant and useful.
Rule: Print only the value of the table cell, and nothing else.
Rule: Start each response with a capital letter. 
Rule: Do not include any punctuation.
${propertyTypePrompt}
Rule: Don't output the exact text "${propertyText}".`,
                  `For a ${tableText} named ${rowText}, output the property for ${propertyText}.` //                 `
                  // Table Name: ${tableText}
                  // Row Name: ${rowText}
                  // Column Name: ${propertyText}`
                );

                console.log("value", value);

                await row.setTagPropertyValue(args.columnPropertyId, [value]);
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
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const configuration = new Configuration({
    apiKey: openAIKey,
  });
  const openai = new OpenAIApi(configuration);

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  console.log(systemPrompt, userPrompt, chatCompletion.data.choices[0].message);

  return chatCompletion.data.choices[0].message?.content!;
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
