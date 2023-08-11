import {
  declareIndexPlugin,
  ReactRNPlugin,
  SelectionType,
} from "@remnote/plugin-sdk";
import "../style.css";

const CSS = `
.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="hide-in-queue"]:not(.rn-question-rem) > .rn-queue-rem > .RichTextViewer{
  visibility: hidden;
}

.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="hide-in-queue"]:not(.rn-question-rem) > .rn-flashcard-delimiter {
  visibility: hidden;
} 

.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="hide-in-queue"]:not(.rn-question-rem) > .RichTextViewer {
  visibility: hidden;
} 

.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="hide-in-queue"]:not(.rn-question-rem) > .rn-queue-rem > .rn-bullet-container:after{
  content: "Hidden in queue";
  opacity: .3;
  white-space: nowrap;
  position: absolute;
  left: 25px;
}

.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="hide-in-queue"]:not(.rn-question-rem) > .rem-bullet__document {
  background-color: transparent !important;
}

.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="hide-in-queue"]:not(.rn-question-rem) > .rem-bullet__document:after {
  content: "Hidden in queue";
  opacity: .3;
  white-space: nowrap;
  position: absolute;
  left: 25px;
}

.rn-breadcrumb-item[data-rem-tags~="hide-in-queue"] {
  opacity: 0;
}

.rn-queue__content [data-queue-rem-container-tags~="remove-from-queue"]:not(.rn-question-rem) > .rn-queue-rem {
  display: none;
}

.rn-queue__content [data-queue-rem-container-tags~="remove-from-queue"]:not(.rn-question-rem) {
  margin-left: 0px !important;
}

.rn-breadcrumb-item[data-rem-tags~="remove-from-queue"] {
  opacity: 0;
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
const NO_HIERARCHY_POWERUP_CODE = "noHierarchy";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup(
    "No Hierarchy",
    NO_HIERARCHY_POWERUP_CODE,
    "Removes the ancestor hierarchy of the tagged Rem in the queue view.",
    {
      slots: [],
    }
  );

  const runAddPowerupCommand = async (powerup: string) => {
    const sel = await plugin.editor.getSelection();
    const selType = sel?.type;
    if (!selType) {
      return;
    }
    if (selType === SelectionType.Rem) {
      const rems = (await plugin.rem.findMany(sel.remIds)) || [];
      rems.forEach((r) => r.addPowerup(powerup));
    } else {
      const rem = await plugin.rem.findOne(sel.remId);
      rem?.addPowerup(powerup);
    }
  };

  await plugin.app.registerCommand({
    id: `${NO_HIERARCHY_POWERUP_CODE}Cmd`,
    name: "No Hierarchy",
    action: async () => {
      await runAddPowerupCommand(NO_HIERARCHY_POWERUP_CODE);
    },
  });

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
      await runAddPowerupCommand(HIDE_IN_QUEUE_POWERUP_CODE);
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
      await runAddPowerupCommand(REMOVE_FROM_QUEUE_POWERUP_CODE);
    },
  });

  await plugin.app.registerCSS("powerup", CSS);
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
