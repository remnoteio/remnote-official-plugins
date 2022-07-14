import {
  RemId,
  WidgetLocation,
  declareIndexPlugin,
  ReactRNPlugin,
  AppEvents,
} from "@remnote/plugin-sdk";
import "../style.css";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget(
    "right_sidebar",
    WidgetLocation.RightSidebar,
    {
      dimensions: { height: "100%", width: "100%" },
      widgetTabIcon: "https://i.imgur.com/MLaBDJw.png",
    }
  );

  // Each time the user opens a Rem, we record this event in synced storage.
  // We can use the useSyncedStorage hook in widget components to reactively
  // get this list of history entries.
  //
  // Since we are using synced storage, the data persists between refreshes
  // and gets synced between devices.

  plugin.event.addListener(
    AppEvents.GlobalOpenRem,
    undefined,
    async (message) => {
      const currentRemId = message.remId as RemId;
      const currentRemData = (await plugin.storage.getSynced("remData")) || [];

      if (currentRemData[0]?.remId != currentRemId) {
        await plugin.storage.setSynced("remData", [
          {
            key: Math.random(),
            remId: currentRemId,
            open: false,
            time: new Date().getTime(),
          },
          ...currentRemData,
        ]);
      }
    }
  );
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
