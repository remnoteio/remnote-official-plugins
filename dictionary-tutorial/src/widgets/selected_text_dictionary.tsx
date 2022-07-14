import {
  renderWidget,
  usePlugin,
  RNPlugin,
  useRunAsync,
  useTracker,
} from "@remnote/plugin-sdk";
import { PreviewDefinitions } from "../components/PreviewDefinitions";
import { WordData, GroupedDefinition } from "../lib/models";
import { useDebounce } from "../hooks/useDebounce";
import * as R from "react";

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
  // Find the root Rem where we want to add the word defitions as children.
  const rootRemName = (await plugin.settings.getSetting("root")) as string;
  if (!rootRemName) {
    plugin.app.toast("You need to set the Dictionary Root Rem setting!", { autoClose: 2000 });
    return;
  }
  const rootRem = await plugin.rem.findByName([rootRemName], null);
  if (!rootRem) {
    plugin.app.toast("Failed to find the root rem", { autoClose: 2000 });
    return;
  }

  const word = `${definition.word} (${definition.partOfSpeech})`;
  const definitions = definition.meanings
    .map((meaning) => meaning.definitions.map((def) => def.definition))
    .flat();
  const wordRem = await plugin.rem.createRem();
  if (wordRem) {
    // Set the key to the word.
    // This will show as the question side of the flashcard.
    await wordRem.setText([word]);
    for (const def of definitions) {
      // Add the definitions as children of the wordRem
      // Set each child to be a card item.
      // These will show as the answer side of the flashcard.
      const child = await plugin.rem.createRem();
      await child?.setText([def]);
      await child?.setParent(wordRem._id);
      await child?.setIsCardItem(true);
    }
    // To make the wordRem a child of the rootRem, set its parent
    // to the rootRem.
    await wordRem.setParent(rootRem._id);
    // Practice the flashcard in both directions
    await wordRem.setPracticeDirection("both");
    // Success!
    plugin.app.toast("Added!", { autoClose: 2000 });
  } else {
    plugin.app.toast("Failed to save the word to your knowledge base.", {
      autoClose: 2000,
    });
  }
}

interface ResponseProps {
  searchTerm: string | undefined;
  wordData: WordData | undefined;
}

const DictionaryResponse: R.FC<ResponseProps> = (props) => {
  const plugin = usePlugin();
  const { searchTerm, wordData } = props;
  if (!searchTerm) {
    return <p>Highlight some text to search for a definition!</p>;
  } else {
    if (wordData) {
      return (
        <PreviewDefinitions
          wordData={wordData}
          onSelectDefinition={(d) => addSelectedDefinition(plugin, d)}
        />
      );
    } else {
      return <p>Loading...</p>;
    }
  }
};

function SelectedTextDictionary() {
  const plugin = usePlugin();

  // This stores the response from the dictionary API.
  const [wordData, setWordData] = R.useState<WordData>();

  // the `useEditorGetSelectedRichTextReactive` hook
  // watches the current selected text in RemNote and
  // rerenders our component every time it changes.
  //
  // This can lead to many unnecessary rerenders and
  // dictionary API calls - every character you select will
  // cause a rerender and an API call, so we debounce the
  // selected text value to only set it once the selected text
  // value has not been updated for 0.5 seconds.
  const selTextRichText = useDebounce(
    useTracker(async (reactivePlugin) => await reactivePlugin.editor.getSelectedRichText(), []),
    500 // 0.5 seconds
  );

  const searchTerm = cleanSelectedText(
    // `useRunAPIMethod` hook allows us to call the async
    // plugin.richText.toString function inline, rather
    // than needing to wrap things in useEffect and setState.
    useRunAsync(async () => await plugin.richText.toString(selTextRichText || []), [selTextRichText])
  );

  // When the searchTerm value changes, and it is not null or undefined,
  // call the dictionary API to get the definition of the searchTerm.
  // If we get a valid response, set the response into the wordData state
  // variable.
  R.useEffect(() => {
    const getAndSetData = async () => {
      if (!searchTerm) {
        return;
      }
      try {
        // In this plugin we are using a free dictionary API service.
        // Note: this particular dictionary API only works with English.
        // Read more about it here: https://dictionaryapi.dev/
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
        const response = await fetch(url + searchTerm);
        const json = await response.json();
        setWordData(Array.isArray(json) ? json[0] : null);
      } catch (e) {
        console.log("Error getting dictionary info: ", e);
      }
    };

    getAndSetData();
  }, [searchTerm]);

  return (
    <div className="min-h-[200px] max-h-[500px] overflow-y-scroll m-4">
      <DictionaryResponse wordData={wordData} searchTerm={searchTerm} />
    </div>
  );
}

renderWidget(SelectedTextDictionary);
