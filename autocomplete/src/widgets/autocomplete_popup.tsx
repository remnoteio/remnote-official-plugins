import {
  renderWidget,
  usePlugin,
  AppEvents,
  RichTextInterface,
  useAPIEventListener,
  useRunAsync,
  useTracker,
  WidgetLocation,
  SelectionType,
  RICH_TEXT_FORMATTING,
} from "@remnote/plugin-sdk";
import * as R from "react";
import clsx from "clsx";
import {
  selectNextKeyId,
  selectPrevKeyId,
  insertSelectedKeyId,
} from "../lib/constants";
import * as Re from "remeda";
import { useSyncWidgetPositionWithCaret } from "../lib/hooks";
import { allRemText } from "../lib/utils";
import isURL from "isurl";

function AutocompletePopup() {
  const plugin = usePlugin();
  const ctx = useRunAsync(
    async () =>
      await plugin.widget.getWidgetContext<WidgetLocation.FloatingWidget>(),
    []
  );

  const [hidden, setHidden] = R.useState(true);
  const floatingWidgetId = ctx?.floatingWidgetId;

  useSyncWidgetPositionWithCaret(floatingWidgetId, hidden);

  // Reactively get hotkey strings - if the user updates these in
  // the settings this component will re-render with the latest
  // values without requiring the user to refresh / reload.

  const selectNextKey = useTracker(
    async (reactivePlugin) =>
      await reactivePlugin.settings.getSetting(selectNextKeyId)
  ) as string;
  const selectPrevKey = useTracker(
    async (reactivePlugin) =>
      await reactivePlugin.settings.getSetting(selectPrevKeyId)
  ) as string;
  const insertSelectedKey = useTracker(
    async (reactivePlugin) =>
      await reactivePlugin.settings.getSetting(insertSelectedKeyId)
  ) as string;

  // Steal autocomplete navigation and insertion keys from the editor
  // while the floating autocomplete window is open.

  R.useEffect(() => {
    const keys = [selectNextKey, selectPrevKey, insertSelectedKey];
    if (!floatingWidgetId) {
      return;
    }
    if (!hidden) {
      plugin.window.stealKeys(floatingWidgetId, keys);
    } else {
      plugin.window.releaseKeys(floatingWidgetId, keys);
    }
  }, [hidden]);

  useAPIEventListener(AppEvents.StealKeyEvent, floatingWidgetId, ({ key }) => {
    if (key === selectNextKey) {
      selectAdjacentWord("down");
    } else if (key === selectPrevKey) {
      selectAdjacentWord("up");
    } else if (key === insertSelectedKey) {
      insertSelectedWord();
    }
  });

  // useTracker subscribes to AppEvents for us, and reacts
  // if they change, so we always get the latest documentRem value

  const documentRem = useTracker(async (reactivePlugin) => {
    const paneId = await reactivePlugin.window.getFocusedPaneId();
    const remId = await reactivePlugin.window.getOpenPaneRemId(paneId);
    return reactivePlugin.rem.findOne(remId);
  });

  // Whenever we change documents we first get all Rem descendants and
  // add their text to the remWordsMap.

  const allInitialDescendants =
    useRunAsync(
      async () => await documentRem?.getDescendants(),
      [documentRem?._id]
    ) || [];

  const [remWordsMap, setRemWordsMap] = R.useState<
    Record<string, RichTextInterface>
  >({});

  R.useEffect(() => {
    const map = allInitialDescendants.reduce((acc, rem) => {
      acc[rem._id] = allRemText(rem);
      return acc;
    }, {} as Record<string, RichTextInterface>);
    setRemWordsMap(map);
  }, [allInitialDescendants.length]);

  // Then we subscribe to a global rem changed event and update the remWordsMap
  // Note that this could be improved because this will also include
  // rem in other documents which have been changed without editing their text.

  useAPIEventListener(AppEvents.GlobalRemChanged, undefined, async (data) => {
    const rem = await plugin.rem.findOne(data.remId);
    if (!rem) {
      return;
    }
    setRemWordsMap(Re.set(rem._id, allRemText(rem)));
  });

  // The last partial word is the current part of a word before the
  // caret that the user has not yet finished typing. We use the
  // lastPartialWord to filter down the autocomplete suggestions to
  // show in the popup window.

  const [lastPartialWord, setLastPartialWord] = R.useState<string>();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = R.useState<
    string[]
  >([]);

  R.useEffect(() => {
    const effect = async () => {
      if (!lastPartialWord || lastPartialWord.length === 0) {
        return;
      }
      const allWordsAsRichText: RichTextInterface = Re.flattenDeep(
        Object.values(remWordsMap)
      );
      const allWordsAsString = await plugin.richText.toString(
        allWordsAsRichText
      );
      const matchingWords = Re.pipe(
        allWordsAsString,
        // remove punctuation at word boundaries
        (s: string) => s?.replace(/\b[^\w\s]+\B|\B[^\w\s]+\b/g, ""),
        // split on whitespace
        (s: string) => s?.split(/(\s+)/) || [],
        Re.filter((word) => {
          const lowerCaseWord = word.trim().toLowerCase();
          return (
            word != null &&
            word.length >= 3 &&
            !isURL(word) &&
            lowerCaseWord.startsWith(lastPartialWord.toLowerCase()) &&
            lowerCaseWord !== lastPartialWord.toLowerCase()
          );
        }),
        Re.uniq(),
        Re.sortBy((x) => x.length)
      );
      setAutocompleteSuggestions(matchingWords);
    };
    effect();
  }, [remWordsMap, lastPartialWord]);

  R.useEffect(() => {
    if (lastPartialWord && autocompleteSuggestions.length > 0) {
      setHidden(false);
    } else {
      setHidden(true);
    }
  }, [lastPartialWord, autocompleteSuggestions]);

  useTracker(async (reactivePlugin) => {
    const editorText = await reactivePlugin.editor.getFocusedEditorText();
    // intentionally non-reactive
    const sel = await plugin.editor.getSelection();
    // don't open autocomplete popup if the user is writing a reference or tag
    if (
      !sel ||
      !editorText ||
      sel.type === SelectionType.Rem ||
      sel.range.start !== sel.range.end ||
      editorText.some(
        (x) =>
          x["workInProgressTag"] ||
          x["workInProgressRem"] ||
          x["workInProgressPortal"] ||
          x["workInProgressTemplate"]
      )
    ) {
      return;
    }
    const prevLine = await plugin.richText.toString(
      await plugin.richText.substring(editorText, 0, sel.range.start)
    );
    // don't match slash command
    const lpwMatch = prevLine?.match(/\b(\w+)$/);
    const idx = lpwMatch?.index;
    if (idx && prevLine[idx - 1] === "/") {
      return;
    }
    const lpw = lpwMatch?.[0]?.toLowerCase().trim();
    setLastPartialWord(lpw);
  });

  const [selectedIdx, setSelectedIdx] = R.useState(0);

  R.useEffect(() => {
    if (!hidden) {
      setSelectedIdx(0);
    }
  }, [lastPartialWord]);

  return (
    <div className={clsx("p-[3px] rounded-lg", hidden && "hidden")}>
      <div
        className={clsx(
          "flex flex-col content-start gap-[0.5] w-full box-border p-2",
          "rounded-lg rn-clr-background-primary rn-clr-content-primary shadow-md border border-gray-100"
        )}
      >
        {autocompleteSuggestions.map((word, idx) => (
          <div
            key={word}
            className={clsx(
              "rounded-md p-2 truncate",
              idx === selectedIdx && "rn-clr-background--hovered"
            )}
            onMouseEnter={() => setSelectedIdx(idx)}
            onMouseDown={() => insertWord(idx)}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );

  function selectAdjacentWord(direction: "up" | "down") {
    const newIdx = selectedIdx + (direction === "up" ? -1 : 1);
    if (newIdx >= 0 && newIdx < autocompleteSuggestions.length) {
      setSelectedIdx(newIdx);
    }
  }

  async function insertWord(idx: number) {
    const selectedWord = autocompleteSuggestions[idx];
    if (lastPartialWord && selectedWord && selectedWord.length > 0) {
      await plugin.editor.deleteCharacters(lastPartialWord.length, -1);
      await plugin.editor.insertMarkdown(selectedWord + " ");
    }
  }

  async function insertSelectedWord() {
    insertWord(selectedIdx);
  }
}

renderWidget(AutocompletePopup);
