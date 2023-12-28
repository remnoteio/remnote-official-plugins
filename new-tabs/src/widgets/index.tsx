import {
  WidgetLocation,
  declareIndexPlugin,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import { getOrCreateHomeWorkspace } from "../shared";
import "../style.css";
import { focusedTabIndexKey, tabsKey } from "../lib/consts";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup("workspace", "workspace", "workspace", {
    slots: [{ code: "windowTree", name: "Window Tree" }],
  });

  await plugin.app.registerWidget("tabs", WidgetLocation.TopBar, {
    dimensions: { height: "auto", width: "100%" },
  });

  await plugin.app.registerCommand({
    id: "next-tab",
    name: "Focus Next Tab",
    description: "Focus the tab to the right of the currently focused tab.",
    action: async () => {
      const focusedTabIndex =
        (await plugin.storage.getSession<number>(focusedTabIndexKey)) || 0;
      const tabs = (await plugin.storage.getSession<any[]>(tabsKey)) || [];
      const newTabIndex =
        (((focusedTabIndex + 1) % tabs.length) + tabs.length) % tabs.length;
      await plugin.storage.setSession(focusedTabIndexKey, newTabIndex);
    },
  });

  await plugin.app.registerCommand({
    id: "prev-tab",
    name: "Focus Previous Tab",
    description: "Focus the tab to the left of the currently focused tab.",
    action: async () => {
      const focusedTabIndex =
        (await plugin.storage.getSession<number>(focusedTabIndexKey)) || 0;
      const tabs = (await plugin.storage.getSession<any[]>(tabsKey)) || [];
      const newTabIndex =
        (((focusedTabIndex - 1) % tabs.length) + tabs.length) % tabs.length;
      await plugin.storage.setSession(focusedTabIndexKey, newTabIndex);
    },
  });

  await getOrCreateHomeWorkspace(plugin);
}

async function onDeactivate() {}

declareIndexPlugin(onActivate, onDeactivate);
