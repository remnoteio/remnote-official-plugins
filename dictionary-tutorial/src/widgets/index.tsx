import {
  WidgetLocation,
  declareIndexPlugin,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget(
    "selected_text_dictionary",
    WidgetLocation.SelectedTextMenu,
    {
      dimensions: { height: "auto", width: "100%" },
      widgetTabIcon: "https://cdn-icons-png.flaticon.com/512/2069/2069571.png",
      widgetTabTitle: "Dictionary",
    }
  );

  await plugin.settings.registerStringSetting({
    id: "root",
    title: "Root Rem",
    description: "The Rem to add words to.",
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
