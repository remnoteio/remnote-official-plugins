import {
  WidgetLocation,
  declareIndexPlugin,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";
import { rootRemSettingId } from "../lib/constants";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget(
    "selected_text_dictionary",
    WidgetLocation.SelectedTextMenu,
    {
      dimensions: { height: "auto", width: "100%" },
      widgetTabIcon: `${plugin.rootURL}dictionary.svg`,
      widgetTabTitle: "Dictionary",
    }
  );

  await plugin.settings.registerStringSetting({
    id: rootRemSettingId,
    title: "Dictionary Root Rem",
  });

  await plugin.app.registerCommand({
    id: "test",
    name: "Test Command",
    action: () => plugin.app.toast("Hello World 8.7"),
  })
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
