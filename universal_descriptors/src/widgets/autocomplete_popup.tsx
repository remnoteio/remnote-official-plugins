import {
  AppEvents,
  Rem,
  renderWidget,
  RichTextInterface,
  useAPIEventListener,
  usePlugin,
  useRunAsync,
  useTracker,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import clsx from "clsx";
import * as R from "react";
import { sortBy, } from "remeda";
import {
  insertSelectedKeyId,
  selectNextKeyId,
  selectPrevKeyId,
} from "../lib/constants";
import { useSyncWidgetPositionWithCaret } from "../lib/hooks";

interface UniversalSlot {
  _id: string;
  aliasId: string;
  text: string;
  matchText: string;
}

function AutocompletePopup() {
  const plugin = usePlugin();
  const ctx = useRunAsync(
    async () => await plugin.widget.getWidgetContext<WidgetLocation.FloatingWidget>(),
    []
  );

  async function getUniversalSlotsForRem(rem: Rem): Promise<UniversalSlot[]> {
    return await Promise.all(
      [rem, ...(await rem.getAliases())].map(async (r: Rem) => ({
        _id: rem._id,
        aliasId: r._id,
        matchText: (await plugin.richText.toString(r.text)).trim(),
        text: `${await plugin.richText.toString(rem.text)} ${await aliasText(
          rem,
          r
        )}`,
      }))
    );
  }

  async function aliasText(rem: Rem, r: Rem) {
    return rem._id == r._id
      ? ""
      : ` (${await plugin.richText.toString(r.text)})`;
  }

  const universalSlots: UniversalSlot[] =
    useTracker(async (r) => {
      const tilde = await r.rem.findByName(["~"], null);
      const universalSlotChildren = (await tilde?.getChildrenRem()) || [];

      return sortBy(
        (await Promise.all(universalSlotChildren.map(getUniversalSlotsForRem)))
          .flat()
          .filter((e) => e.matchText.length > 0 && e.text.length > 0),
        (q) => q.matchText.length
      );
    }, []) || [];

  // The last partial word is the current part of a word before the
  // caret that the user has not yet finished typing. We use the
  // lastPartialWord to filter down the autocomplete suggestions to
  // show in the popup window.

  const [lastPartialWord, setLastPartialWord] = R.useState<string>();

  const matches: UniversalSlot[] = lastPartialWord?.startsWith("~")
    ? // _.sortBy(
      universalSlots.filter((u) =>
        u.matchText
          .replaceAll("~", "")
          .toLowerCase()
          .startsWith(lastPartialWord.toLowerCase().substring(1))
      )
    : [];

  const hidden = matches.length == 0;

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

  const updateLastPartialWord = async (newText: RichTextInterface) => {
    const selection = await plugin.editor.getSelectedText();
    if (!selection) return;
    const prevLine: string | undefined = await plugin.richText.toMarkdown(
      await plugin.richText.substring(newText, 0, selection.range.start)
    );

    const i = prevLine?.lastIndexOf("~");
    const lpw =
      i !== undefined ? prevLine?.substring(i)?.toLowerCase() : undefined;
    setLastPartialWord(lpw);
  };

  useAPIEventListener(
    AppEvents.EditorTextEdited,
    undefined,
    async (newText: RichTextInterface) => {
      updateLastPartialWord(newText);
    }
  );

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
        {matches.map((word, idx) => (
          <div
            key={word.aliasId}
            className={clsx(
              "rounded-md p-2 truncate",
              idx === selectedIdx && "rn-clr-background--hovered"
            )}
            onMouseEnter={() => setSelectedIdx(idx)}
            onClick={() => selectResult(word)}
          >
            {word.text}
          </div>
        ))}
      </div>
    </div>
  );

  function selectAdjacentWord(direction: "up" | "down") {
    const newIdx = selectedIdx + (direction === "up" ? -1 : 1);
    if (newIdx >= 0 && newIdx < matches.length) {
      setSelectedIdx(newIdx);
    }
  }

  async function selectResult(word: UniversalSlot | undefined) {
    if (lastPartialWord && word) {
      await plugin.editor.deleteCharacters(lastPartialWord.length, -1);
      await plugin.editor.insertRichText(
        await plugin.richText.rem(word._id).value()
      );
    }
  }

  async function insertSelectedWord() {
    selectResult(matches[selectedIdx]);
  }
}

renderWidget(AutocompletePopup);
