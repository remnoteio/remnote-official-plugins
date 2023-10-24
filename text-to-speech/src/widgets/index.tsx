import {
  declareIndexPlugin,
  PluginCommandMenuLocation,
  ReactRNPlugin,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import "../App.css";
import "../style.css";

async function onActivate(plugin: ReactRNPlugin) {
  plugin.app.registerPowerup(
    "Text to Speech",
    "textToSpeechPlugin",
    "Adds text to speech in the flashcard queue",
    {
      slots: [
        {
          code: "textToSpeechPlugin",
          name: "Text to Speech",
          onlyProgrammaticModifying: true,
          hidden: true,
        },
      ],
    }
  );

  plugin.app.registerCommand({
    id: "text-to-speech-enable",
    name: "Enable Text to Speech",
    description:
      "Enable flashcard queue text to speech buttons for the focused rem and all its descendants",
    action: async () => {
      const focusedRem = await plugin.focus.getFocusedRem();
      const focusedRemDescendants = await focusedRem?.getDescendants();

      focusedRem?.addPowerup("textToSpeechPlugin");
      focusedRemDescendants?.forEach((descendant) => {
        descendant.addPowerup("textToSpeechPlugin");
      });

      plugin.app.toast("Text to Speech enabled!");
    },
  });

  plugin.app.registerCommand({
    id: "text-to-speech-disable",
    name: "Disable Text to Speech",
    description:
      "Disable flashcard queue text to speech buttons for the focused rem and all its descendants",
    action: async () => {
      const focusedRem = await plugin.focus.getFocusedRem();
      const focusedRemDescendants = await focusedRem?.getDescendants();

      focusedRem?.removePowerup("textToSpeechPlugin");
      focusedRemDescendants?.forEach((descendant) => {
        descendant.removePowerup("textToSpeechPlugin");
      });

      plugin.app.toast("Text to Speech disabled!");
    },
  });

  plugin.app.registerWidget("text-to-speech", WidgetLocation.FlashcardUnder, {
    dimensions: { height: "auto", width: "auto" },
  });

  plugin.app.registerMenuItem({
    name: "Toggle Text to Speech for This Card",
    id: "text-to-speech-toggle",
    location: PluginCommandMenuLocation.QueueMenu,
    action: async ({ remId }: { remId?: string }) => {
      const contextRem = await plugin.rem.findOne(remId);

      if (await contextRem?.hasPowerup("textToSpeechPlugin")) {
        contextRem?.removePowerup("textToSpeechPlugin");
        plugin.app.toast("Text to Speech disabled!");
      } else {
        contextRem?.addPowerup("textToSpeechPlugin");
        plugin.app.toast("Text to Speech enabled!");
      }
    },
  });

  plugin.app.registerMenuItem({
    name: "Toggle Text to Speech Auto-Play for All Cards",
    id: "text-to-speech-toggle-autoplay",
    location: PluginCommandMenuLocation.QueueMenu,
    action: async () => {
      const autoPlayEnabled = await plugin.storage.getSynced(
        "autoPlayTextToSpeech"
      );
      await plugin.storage.setSynced("autoPlayTextToSpeech", !autoPlayEnabled);
      plugin.app.toast(
        `Text to Speech auto-play ${autoPlayEnabled ? "disabled" : "enabled"}!`
      );
    },
  });

  speechSynthesis.onvoiceschanged = () => {
    plugin.settings.registerDropdownSetting({
      id: "text-to-speech-voice",
      title: "Voice",
      description: "Select the voice to use for text to speech",
      defaultValue: "Google US English",
      options: speechSynthesis.getVoices().map((voice, i) => ({
        key: i.toString(),
        label: `${voice.name} (${voice.lang})`,
        value: voice.name,
      })),
    });
  };
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
