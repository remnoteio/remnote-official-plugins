import {
  declareIndexPlugin,
  ReactRNPlugin,
  WidgetLocation,
  PaneRemWindowTree,
  PaneRem,
} from "@remnote/plugin-sdk";
import "../style.css";
import {
  isAbsoluteFocusModeStorageKey,
  isMonocleModeStorageKey,
  restoreLayoutStorageKey,
  tabIdxStorageKey,
} from "../lib/constants";
import { log } from "../lib/logging";
import { getAllPaneRemIds } from "../lib/windowTreeUtils";

let absolutePaneFocusModeTimeout: NodeJS.Timeout | undefined;

async function onActivate(plugin: ReactRNPlugin) {
  // Shows a list of panes in the top bar
  // while you are in monocle mode.
  await plugin.app.registerWidget("pane_tabs", WidgetLocation.TopBar, {
    dimensions: { height: "auto", width: "100%" },
  });

  // Displays the pane number in the header of multiple pane windows
  // so you can focus using numbered shortcuts.
  await plugin.app.registerWidget(
    "multiple_panes_pane_number",
    WidgetLocation.PaneHeader,
    {
      dimensions: { height: "auto", width: "auto" },
    }
  );

  // Handles focusing panes using the alt/opt+number shortcuts
  // both in multiple panes mode as well as monocle mode.

  const focusPaneByIdx = async (paneIdx: number) => {
    const isMonocleMode = await plugin.storage.getSession(
      isMonocleModeStorageKey
    );
    const cwt = (isMonocleMode
      ? await plugin.storage.getSession(restoreLayoutStorageKey)
      : await plugin.window.getCurrentWindowTree()) as PaneRemWindowTree;
    const allPaneRemIds = getAllPaneRemIds(cwt) || [];
    const paneRem = allPaneRemIds[paneIdx];
    if (!paneRem) {
      return;
    }
    if (isMonocleMode) {
      await plugin.window.setRemWindowTree(paneRem.remId);
      const newTree = await plugin.window.getCurrentWindowTree();
      await plugin.window.setFocusedPaneId((newTree as PaneRem).paneId);
      await plugin.storage.setSession(tabIdxStorageKey, paneIdx);
    } else {
      await plugin.window.setFocusedPaneId(paneRem.paneId);
    }
  };

  // Registers commands to focus panes using a modifier +
  // the pane number displayed in the pane header.
  for (let i = 0; i < 9; i++) {
    await plugin.app.registerCommand({
      id: `focusPane${i + 1}`,
      name: `Focus Pane ${i + 1}`,
      keyboardShortcut: `opt+${i + 1}`,
      action: () => focusPaneByIdx(i),
    });
  }

  // Used to only show the numbers in the pane headers
  // when the user presses the `opt` key.
  await plugin.app.registerCommand({
    id: `absolutePaneFocusMode`,
    name: `Absolute Pane Focus Mode`,
    keyboardShortcut: `opt`,
    action: () => {
      if (absolutePaneFocusModeTimeout) {
        clearTimeout(absolutePaneFocusModeTimeout);
      }
      plugin.storage.setSession(isAbsoluteFocusModeStorageKey, true);
      absolutePaneFocusModeTimeout = setTimeout(() => {
        plugin.storage.setSession(isAbsoluteFocusModeStorageKey, false);
      }, 3500);
    },
  });

  // Registers a command to toggle the
  // zoomed in pane mode.

  await plugin.app.registerCommand({
    id: "monocleMode",
    name: "Toggle Monocle Mode",
    keyboardShortcut: "opt+shift+m",
    action: async () => {
      const pane = await plugin.window.getLastFocusedPane();
      const isMonocleMode = await plugin.storage.getSession(
        isMonocleModeStorageKey
      );
      if (!isMonocleMode && pane) {
        const currentWindowTree = await plugin.window.getCurrentWindowTree();
        if ("remId" in currentWindowTree) {
          log(
            plugin,
            "Ignoring monocle mode - there is only one current pane."
          );
          return;
        } else {
          await plugin.storage.setSession(isMonocleModeStorageKey, true);
        }
      } else if (isMonocleMode) {
        await plugin.storage.setSession(isMonocleModeStorageKey, false);
      }
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
