import {
  declareIndexPlugin,
  ReactRNPlugin,
  RichTextInterface,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import "../style.css";

export const MERMAID_POWERUP = "memaid_powerup";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup("Mermaid", MERMAID_POWERUP, "A Mermaid plugin", {
    slots: [{ code: "Coding", name: "Code" }],
  });

  await plugin.app.registerWidget("mermaid", WidgetLocation.UnderRemEditor, {
    dimensions: { height: "auto", width: "100%" },
    powerupFilter: MERMAID_POWERUP,
  });

  await plugin.app.registerCommand({
    id: "mermaid",
    name: "Mermaid",
    action: async () => {
      const focusedRemId = await plugin.focus.getFocusedRemId();
      const rem = await plugin.rem.findOne(focusedRemId);
      await rem?.addPowerup(MERMAID_POWERUP);
      // TODO: change the rem to code block and add a sample into the text
      await rem?.setText(SAMPLE_MERMAID);
    },
  });


}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);

const SAMPLE_MERMAID: RichTextInterface = [
  {
    text: `graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
    F-->A;`,
    i: "m",
    code: true,
  },
];
