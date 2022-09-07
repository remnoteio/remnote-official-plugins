import { declareIndexPlugin, ReactRNPlugin } from "@remnote/plugin-sdk";
import "../style.css";

const CSS = `
.rn-queue__content--answer-hidden [data-queue-rem-tags~="hide-in-queue"] .RichTextViewer{
  opacity: 0;
} 
.rn-queue__content--answer-hidden [data-queue-rem-tags~="hide-in-queue"] .rn-bullet-container:after{
  content: "Hidden in queue";
  opacity: .3;
  white-space: nowrap;
  position: absolute;
  left: 25px;
} 
`;

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup(
    "Hide in Queue",
    "hideInQueue",
    "Hides the tagged Rem in the queue view.",
    {
      slots: [],
    }
  );

  await plugin.app.registerCSS("powerup", CSS);
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
