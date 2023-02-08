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

.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="remove-from-queue"]:not(.rn-question-rem) {
  margin-left: 0px !important;
}

.rn-queue__content:has(.rn-question-rem[data-queue-rem-container-tags~="no-hierarchy"]) .indented-rem:not(.rn-question-rem) {
  margin-left: 0px !important;
}

.rn-queue__content:has(.rn-question-rem[data-queue-rem-container-tags~="no-hierarchy"]) .indented-rem:not(.rn-question-rem) > .rn-queue-rem {
  display: none;
}
`;

const HIDE_IN_QUEUE_POWERUP_CODE = "hideInQueue";
const REMOVE_FROM_QUEUE_POWERUP_CODE = "removeFromQueue";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup(
    "Hide in Queue",
    HIDE_IN_QUEUE_POWERUP_CODE,
    "Hides the tagged Rem in the queue view.",
    {
      slots: [],
    }
  );

  await plugin.app.registerCommand({
    id: `${HIDE_IN_QUEUE_POWERUP_CODE}Cmd`,
    name: "Hide in Queue",
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      await rem?.addPowerup(HIDE_IN_QUEUE_POWERUP_CODE);
    },
  });

  await plugin.app.registerPowerup(
    "Remove from Queue",
    REMOVE_FROM_QUEUE_POWERUP_CODE,
    "Removes the tagged Rem in the queue view.",
    {
      slots: [],
    }
  );

  await plugin.app.registerCommand({
    id: `${REMOVE_FROM_QUEUE_POWERUP_CODE}Cmd`,
    name: "Remove from Queue",
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      await rem?.addPowerup(REMOVE_FROM_QUEUE_POWERUP_CODE);
    },
  });

  await plugin.app.registerCSS("powerup", CSS);
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
