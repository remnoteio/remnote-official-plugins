import {
  declareIndexPlugin,
  WidgetLocation,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";

export const SMART_BLOCK_POWERUP = "smart_block_powerup";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup(
    "Smart Block",
    SMART_BLOCK_POWERUP,
    "A smart block plugin",
    {
      slots: [{ code: "smart_block", name: "Smart Block" }],
    }
  );

  await plugin.app.registerWidget(
    "smart_block",
    WidgetLocation.UnderRemEditor,
    {
      dimensions: { height: "auto", width: "100%" },
      powerupFilter: SMART_BLOCK_POWERUP,
    }
  );

  await plugin.app.registerCommand({
    id: "smart_block",
    name: "Smart Block",
    action: async () => {
      const focusedRemId = await plugin.focus.getFocusedRemId();
      const rem = await plugin.rem.findOne(focusedRemId);
      await rem?.addPowerup(SMART_BLOCK_POWERUP);
      // TODO: change the rem to code block and add a sample into the text
      await rem?.setText([`Math.floor(Math.min((Math.cos(345)*345), 300))`]);
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
