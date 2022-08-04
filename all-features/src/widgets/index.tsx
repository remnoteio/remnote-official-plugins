import {
  declareIndexPlugin,
  ReactRNPlugin,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import "../style.css";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.settings.registerStringSetting({
    id: "name",
    title: "Name",
    defaultValue: "James",
  });

  await plugin.settings.registerBooleanSetting({
    id: "true or false",
    title: "True or False?",
    defaultValue: true,
  });

  await plugin.settings.registerNumberSetting({
    id: "age",
    title: "Age",
    defaultValue: 24,
  });

  await plugin.app.registerWidget("rem_object", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: 350 },
  });

  await plugin.app.registerWidget("rem_namespace", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: 350 },
  });

  await plugin.app.registerWidget("card_namespace", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: 350 },
  });

  await plugin.app.registerWidget("card_object", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: 350 },
  });

  await plugin.app.registerWidget("powerups", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: 350 },
  });

  await plugin.app.registerWidget("storage", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: 350 },
  });

  await plugin.app.registerWidget("rich_text", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: 350 },
  });

  await plugin.app.registerWidget("search_namespace", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: 350 },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
