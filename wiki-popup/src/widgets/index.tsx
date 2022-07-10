import {
  WidgetLocation,
  declareIndexPlugin,
  ReactRNPlugin,
  AppEvents,
  BuiltInPowerupCodes,
  RNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";
import {tryCreateWikiExtractURL} from "../lib/wikipedia";
import {remIdKey, locationKey} from "../lib/constants";

let timer: number;
let openWidgetInfo: {floatingWidgetId: string, remId: string} | undefined;
let renderLocation: WidgetLocation;

const renderAtLocation = async (plugin: RNPlugin, location: WidgetLocation) => {
  
  // Each time the user changes the render location setting, re-register
  // the widget and unregister the widget at the old location

  if (location === WidgetLocation.RemReferencePopupRight) {
    await plugin.registerWidget(
      "rem_ref_widget",
      WidgetLocation.RemReferencePopupRight,
      {
        dimensions: { height: "auto", width: "400px" },
      }
    );

    await plugin.unregisterWidget(
      "floating_widget",
      WidgetLocation.FloatingWidget,
    )
  }
  else {
    await plugin.registerWidget(
      "floating_widget",
      WidgetLocation.FloatingWidget,
      {
        dimensions: { height: "auto", width: "400px" },
      }
    )
    await plugin.unregisterWidget(
      "rem_ref_widget",
      WidgetLocation.RemReferencePopupRight,
    )
  }
}

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.settings.registerDropdownSetting({
    id: locationKey,
    title: "Render Location",
    defaultValue: WidgetLocation.RemReferencePopupRight,
    options: [{
      key: "0",
      label: "Rem Reference Right-Click Popup",
      value: WidgetLocation.RemReferencePopupRight,
    },
    {
      key: "1",
      label: "Floating Window",
      value: WidgetLocation.FloatingWidget,
    }]
  })

  renderLocation = (await plugin.settings.getSetting(locationKey)) as WidgetLocation;
  await renderAtLocation(plugin, renderLocation as WidgetLocation);

  plugin.addListener(AppEvents.SettingChanged, locationKey, ({value}) => {
    renderLocation = value;
    renderAtLocation(plugin, value as WidgetLocation)
  })

  plugin.addListener(AppEvents.MouseOverLink, undefined, (args) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (renderLocation !== WidgetLocation.FloatingWidget) {
        return
      }
      const rem = await plugin.rem.findOne(args.remId);
      // check that the Rem is a web link
      const link = await rem?.getPowerupProperty(BuiltInPowerupCodes.Link, "URL")
      // check that the Rem is a wikipedia link
      if (link && rem && !!tryCreateWikiExtractURL(link)) {
        await plugin.storage.setSession(remIdKey, args.remId);
        const isOpen = openWidgetInfo?.floatingWidgetId && await plugin.window.isFloatingWidgetOpen(openWidgetInfo?.floatingWidgetId);
        if (isOpen || !timer) {
          return;
        }
        const floatingWidgetId = await plugin.window.openFloatingWidget(
          'floating_widget',
          {
            left: args.clientX,
            top: args.clientY + 20
          })
        openWidgetInfo = {floatingWidgetId, remId: args.remId}
      }
    }, 500)
  })

  plugin.addListener(AppEvents.MouseOutLink, undefined, async () => {
    if (timer) {
      clearTimeout(timer);
    }
  })
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
