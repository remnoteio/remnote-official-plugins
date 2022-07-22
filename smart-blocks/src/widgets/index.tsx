import {
  declareIndexPlugin,
  WidgetLocation,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget("smart_block", WidgetLocation.UnderRemEditor, {
    dimensions: { height: "auto", width: "100%" },
  });

  console.log("registerCommand");
  await plugin.app.registerCommand({
    id: "saveCalculation",
    name: "Save calculation",
    action: async () => {
      const focusedId = await plugin.focus.getFocusedRemId();
      if (focusedId) {
        const rem = await plugin.rem.findOne(focusedId);
        const remText = await plugin.richText.toString(rem?.text || []);

        const portalId = await plugin.focus.getFocusedPortalId();
        const portal = await plugin.rem.findOne(portalId);

        console.log("portal", portal, portalId);

        const newRem = await plugin.rem.createRem();
        await newRem?.setParent(rem?._id || "", 0);
        await newRem?.addToPortal(portal?._id || "");

        let val = "";
        try {
          val = "" + eval(remText);
        } catch {}

        await newRem?.setText([val]);
      } else {
        await plugin.app.toast("No Rem is focused.");
      }
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
