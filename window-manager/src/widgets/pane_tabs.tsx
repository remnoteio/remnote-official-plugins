import {
  renderWidget,
  usePlugin,
  useSessionStorageState,
  AppEvents,
  RemRichTextEditor,
  PaneRemWindowTree,
  PaneRem,
} from "@remnote/plugin-sdk";
import * as R from "react";
import clsx from "clsx";
import {
  isMonocleModeStorageKey,
  restoreLayoutStorageKey,
  tabIdxStorageKey,
} from "../lib/constants";
import {
  getAllPaneRemIds,
  paneRemTreeToRemTree,
  replaceRemId,
} from "../lib/windowTreeUtils";
import { Direction } from "../lib/types";
import { PaneNumber } from "../components/PaneNumber";

interface PaneProps {
  paneId: string;
  remId: string;
  isFocused: boolean;
  idx: number;
  windowTree: PaneRemWindowTree;
  setTabIndex: R.Dispatch<R.SetStateAction<number>>;
}

const PaneTab: R.FC<PaneProps> = (props) => {
  const plugin = usePlugin();
  return (
    <div
      className={clsx(
        "h-[50px] box-border",
        "cursor-pointer",
        "border-solid border-b-0 border-t-0 border-[0.5px] rn-clr-border-state-disabled",
        props.isFocused
          ? "rn-clr-background-primary"
          : "rn-clr-background-secondary",
        "mb-[-1px] pl-4 pr-1 py-[8px] p-1 ",
        "min-w-[50px] ",
        "whitespace-nowrap",
        "flex items-center flex-row flex-shrink-0 flex-grow-0 gap-2"
      )}
      onClick={async () => {
        await plugin.window.setRemWindowTree(props.remId);
        const newTree = await plugin.window.getCurrentWindowTree();
        await plugin.window.setFocusedPaneId((newTree as PaneRem).paneId);
        props.setTabIndex(props.idx);
      }}
    >
      <PaneNumber windowTree={props.windowTree} paneId={props.paneId} />
      <RemRichTextEditor
        width="expand"
        remId={props.remId}
        readOnly={true}
        className={clsx(
          !props.isFocused && "cursor-pointer pointer-events-none"
        )}
      />
    </div>
  );
};

const PanesBar = () => {
  const plugin = usePlugin();

  // Registers commands every re-render to avoid reading stale state.
  plugin.app.registerCommand({
    name: "Focus Next Pane",
    id: "focusNextPane",
    keyboardShortcut: "opt+pagedown",
    action: () => focusAdjacentPaneWrapped("down"),
  });

  plugin.app.registerCommand({
    name: "Focus Previous Pane",
    id: "focusPrevPane",
    keyboardShortcut: "opt+pageup",
    action: () => focusAdjacentPaneWrapped("up"),
  });

  // Using session storage allows the component to react to the
  // changed value of `isMonocleMode` when it is changed either
  // internally by the component, or externally, eg. by the command
  // in `index.ts`
  const [isMonocleMode, setIsMonocleMode] = useSessionStorageState(
    isMonocleModeStorageKey,
    false
  );

  // The window tree representing the layout we want to return to when the user
  // leaves monocle mode.
  const [restoreLayout, setRestoreLayout] =
    useSessionStorageState<PaneRemWindowTree | null>(
      restoreLayoutStorageKey,
      null
    );
  const [tabIndex, setTabIndex] = useSessionStorageState(tabIdxStorageKey, 0);

  R.useEffect(() => {
    // Each time the `isMonocleMode` variable changes, we check whether we
    // are toggling monocle mode on or off and respond to the change.
    const runEffect = async () => {
      const pane = await plugin.window.getFocusedPaneId();
      const remId = await plugin.window.getOpenPaneRemId(pane);
      if (isMonocleMode && pane && remId) {
        // If we are toggling monocle mode on, we save the user's current layout so
        // can restore it later. We also set the current window tree to just the current
        // focused pane. This is what creates the zoom/monocle effect.
        const curTree = await plugin.window.getCurrentWindowTree();
        const allPaneRem = getAllPaneRemIds(curTree);
        const focusedIdx = allPaneRem.findIndex((x) => x.paneId === pane);
        await plugin.window.setRemWindowTree(remId);
        const newTree = await plugin.window.getCurrentWindowTree();
        await plugin.window.setFocusedPaneId((newTree as PaneRem).paneId);
        setTabIndex(focusedIdx);
        setRestoreLayout(curTree);
      } else {
        // If we are toggling monocle mode off and there is a restorable layout present,
        // set the current window tree in RemNote to the layout.
        if (restoreLayout) {
          await plugin.window.setRemWindowTree(
            paneRemTreeToRemTree(restoreLayout)
          );
          const newTree = await plugin.window.getCurrentWindowTree();
          const newTreeAllPanes = getAllPaneRemIds(newTree);
          const newPaneId = newTreeAllPanes[tabIndex];
          await plugin.window.setFocusedPaneId(newPaneId.paneId);
        }
      }
    };

    // Here we setup a listener to run a function every time the
    // current window tree in RemNote changes.
    //
    // The purpose of this listener is to check if the layout was set
    // externally (not by this plugin), eg. if the user shift-clicks a Rem
    // to open in a new pane, opens a PDF, navigates in the browser etc.

    const updateOnExternalChange = async () => {
      const newTree = await plugin.window.getCurrentWindowTree();
      if (!newTree) return;
      const allPanes = getAllPaneRemIds(newTree);

      // If the user opens a multiple panes layout inside monocle mode,
      // leave monocle mode.
      if (isMonocleMode) {
        if (allPanes.length > 1) {
          setRestoreLayout(newTree);
          setIsMonocleMode(false);
        } else {
          const oldLayout = await plugin.storage.getSession<PaneRemWindowTree>(
            restoreLayoutStorageKey
          );
          const oldAllPaneRems = getAllPaneRemIds(oldLayout!);
          const tabIdx = await plugin.storage.getSession<number>(tabIdxStorageKey);
          const oldPaneId = oldAllPaneRems[tabIdx!].paneId;
          const focusedPaneId = await plugin.window.getFocusedPaneId();
          const remId = await plugin.window.getOpenPaneRemId(focusedPaneId);
          if (remId) {
            const newLayout = replaceRemId(oldLayout!, oldPaneId, remId);
            setRestoreLayout(newLayout);
          }
        }
      }
    };

    runEffect().then((_) => {
      setTimeout(() => {
        plugin.event.addListener(
          AppEvents.URLChange,
          undefined,
          updateOnExternalChange
        );
      }, 20);
    });

    // When using `plugin.event.addListener`, you must remember to
    // manually unsubscribe from the event when the component unmounts.
    // This isn't necessary when using the `useAPIEventListener` hook,
    // so that is preferred in most cases.
    return () => {
      plugin.event.removeListener(
        AppEvents.URLChange,
        undefined,
        updateOnExternalChange
      );
    };
  }, [isMonocleMode]);

  // See the "Focus Next Pane" and "Focus Prev Pane" commands above.
  async function focusAdjacentPaneWrapped(direction: Direction) {
    if (!restoreLayout) {
      return;
    }
    const allPaneRem = getAllPaneRemIds(restoreLayout);
    let newPaneIdx = tabIndex + (direction === "up" ? -1 : 1);
    if (newPaneIdx < 0) {
      newPaneIdx = allPaneRem.length - 1;
    } else if (newPaneIdx >= allPaneRem.length) {
      newPaneIdx = 0;
    }
    const newPane = allPaneRem[newPaneIdx];
    if (newPane) {
      await plugin.storage.setSession(tabIdxStorageKey, newPaneIdx);
      await plugin.window.setRemWindowTree(newPane.remId);
    }
  }

  return isMonocleMode && restoreLayout ? (
    <div
      className={clsx(
        "overflow-x-auto overflow-y-hidden",
        "rn-clr-background-secondary",
        "flex gap-1 items-stretch",
        "p-1 py-0 pl-4"
      )}
    >
      {getAllPaneRemIds(restoreLayout).map((paneRem, idx) => (
        <PaneTab
          windowTree={restoreLayout}
          idx={idx}
          key={paneRem.paneId}
          paneId={paneRem.paneId}
          remId={paneRem.remId}
          isFocused={tabIndex === idx}
          setTabIndex={setTabIndex}
        />
      ))}
    </div>
  ) : null;
};

renderWidget(PanesBar);
