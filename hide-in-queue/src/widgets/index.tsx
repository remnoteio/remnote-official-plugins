import { declareIndexPlugin, ReactRNPlugin } from "@remnote/plugin-sdk";
import "../style.css";

const CSS = `
.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="hide-in-queue"]:not(.rn-question-rem) > .rn-queue-rem > .RichTextViewer{
  visibility: hidden;
} 
.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="hide-in-queue"]:not(.rn-question-rem) > .rn-queue-rem > .rn-bullet-container:after{
  content: "Hidden in queue";
  opacity: .3;
  white-space: nowrap;
  position: absolute;
  left: 25px;
} 
.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="remove-from-queue"]:not(.rn-question-rem) > .rn-queue-rem {
  display: none;
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
  await plugin.app.registerPowerup(
    "Remove from Queue",
    "removeFromQueue",
    "Removes the tagged Rem in the queue view.",
    {
      slots: [],
    }
  );

  await plugin.app.registerCSS("powerup", CSS);
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
