import {
  WidgetLocation,
  declareIndexPlugin,
  ReactRNPlugin,
  AppEvents,
} from "@remnote/plugin-sdk";
import "../style.css";
import {
  POPUP_Y_OFFSET,
  selectNextKeyId,
  selectPrevKeyId,
  insertSelectedKeyId,
} from "../lib/constants";

let lastFloatingWidgetId: string;

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget(
    "autocomplete_popup",
    WidgetLocation.FloatingWidget,
    {
      dimensions: { height: "auto", width: "250px" },
    }
  );

  // The floating widget hotkey system currently uses
  // a different hotkey system than the regular hotkey
  // system because it needs to 'steal' hotkeys like
  // tab and enter from the RemNote editor component.
  //
  // Hotkeys can be customised using strings like `ctrl+enter`
  // or `tab`.

  await plugin.settings.registerStringSetting({
    id: selectNextKeyId,
    title: "Select Next Shortcut",
    defaultValue: "down",
  });

  await plugin.settings.registerStringSetting({
    id: selectPrevKeyId,
    title: "Select Previous Shortcut",
    defaultValue: "up",
  });

  await plugin.settings.registerStringSetting({
    id: insertSelectedKeyId,
    title: "Insert Selected Shortcut",
    defaultValue: "tab",
  });

  const openAutocompleteWindow = async () => {
    const caret = await plugin.editor.getCaretPosition();
    lastFloatingWidgetId = await plugin.window.openFloatingWidget(
      "autocomplete_popup",
      { top: caret ? caret.y + POPUP_Y_OFFSET : undefined, left: caret?.x }
    );
  };

  await openAutocompleteWindow();

  // Whenever the user edits text we check if there is already an open
  // autocomplete floating widget. If there is no current autocomplete widget
  // then open one.

  plugin.event.addListener(AppEvents.EditorTextEdited, undefined, async () => {
    if (
      lastFloatingWidgetId &&
      (await plugin.window.isFloatingWidgetOpen(lastFloatingWidgetId))
    ) {
      return;
    }
    await openAutocompleteWindow();
  });
}

async function onDeactivate(plugin: ReactRNPlugin) {
  const keys = [
    await plugin.settings.getSetting(selectNextKeyId),
    await plugin.settings.getSetting(selectPrevKeyId),
    await plugin.settings.getSetting(insertSelectedKeyId)
  ] as string[];
  await plugin.window.releaseKeys(lastFloatingWidgetId, keys);
}

declareIndexPlugin(onActivate, onDeactivate);
