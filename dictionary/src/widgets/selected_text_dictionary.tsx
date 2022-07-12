import {
  renderWidget,
  usePlugin,
  RNPlugin,
  LoadingSpinner,
  useRunAsync,
  useTracker,
} from "@remnote/plugin-sdk";
import { PreviewDefinitions } from "../components/PreviewDefinitions";
import { WordData, GroupedDefinition } from "../lib/models";
import { useDebounce } from "../hooks/useDebounce";
import { useFetch } from "../hooks/useFetch";
import { apiBaseUrl, getDataFromResponse } from "../lib/dict";
import { log } from "../lib/logging";
import { rootRemSettingId } from "../lib/constants";

function cleanSelectedText(s?: string) {
  return (
    s
      ?.trim()
      ?.split(/(\s+)/)[0]
      // This removes non-alphabetic characters
      // including Chinese characters, Cyrillic etc.
      // But the Dictionary API in this plugin only
      // works with English, so this is okay.
      ?.replaceAll(/[^a-zA-Z]/g, "")
  );
}

async function addSelectedDefinition(
  plugin: RNPlugin,
  definition: GroupedDefinition
): Promise<void> {
  const rootRemName = (await plugin.settings.getSetting(rootRemSettingId)) as
    | string
    | undefined;
  if (!rootRemName) {
    log(plugin, "Need to set the dictionary root rem in the settings!.", true);
    return;
  }
  const rootRem = await plugin.rem.findByName([rootRemName], null);
  if (!rootRem) {
    log(
      plugin,
      `Failed to find dictionary root rem: "${rootRemName}". Please check the settings!`,
      true
    );
    return;
  }
  const word = `${definition.word} (${definition.partOfSpeech})`;
  const definitions = definition.meanings
    .map((meaning) => meaning.definitions.map((def) => def.definition))
    .flat();
  const wordRem = await plugin.rem.createRem();
  await wordRem?.setText([word]);
  for (const def of definitions) {
    const child = await plugin.rem.createRem();
    await child?.setText([def]);
    await child?.setParent(wordRem!._id);
    await child?.setIsCardItem(true);
  }
  if (wordRem) {
    await wordRem.setParent(rootRem._id);
    await wordRem.setPracticeDirection("both");
    log(plugin, "Added!", true);
  } else {
    log(plugin, "Failed to save the word to your knowledge base.", true);
  }
}

function SelectedTextDictionary() {
  const plugin = usePlugin();

  // The `useTracker` hook
  // watches the current selected text in RemNote and
  // rerenders our component every time it changes.
  //
  // This can lead to many unnecessary rerenders and
  // dictionary API calls, so we debounce the selected text
  // value to only set it once the selected text value has
  // not been updated for 0.3 seconds.
  const selTextRichText = useDebounce(
    useTracker(async(reactivePlugin) => {
      return await reactivePlugin.editor.getSelectedRichText()
    }),
    300
  )

  const searchTerm = cleanSelectedText(
    // The `useRunAsync` hook allows us to call the async
    // plugin.richText.toString function inline, rather
    // than needing to wrap things in useEffect and setState.
    useRunAsync(async () => await plugin.richText.toString(selTextRichText || []), [selTextRichText])
  );

  const { response, isLoading, isError } = useFetch<WordData[] | null>(
    // If the search term is not null, request the definition
    // from the dictionary API.
    searchTerm ? apiBaseUrl + searchTerm : null,
    null
  );

  const wordData = getDataFromResponse(response);
  return (
    <div className="min-h-[200px] max-h-[500px] overflow-y-scroll m-4 font-inter">
      {isLoading ? (
        "Loading..."
      ) : isError ? (
        <p>An error occurred fetching the definition</p>
      ) : searchTerm ? (
        wordData ? (
          <PreviewDefinitions
            wordData={wordData}
            onSelectDefinition={(d) => addSelectedDefinition(plugin, d)}
          />
        ) : (
          <p>Could not find a definition for {searchTerm}</p>
        )
      ) : (
        <p>Select a word to search for its definition.</p>
      )}
    </div>
  );
}

renderWidget(SelectedTextDictionary);
