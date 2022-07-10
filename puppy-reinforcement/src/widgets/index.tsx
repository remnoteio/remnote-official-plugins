import {
  WidgetLocation,
  AppEvents,
  RNPlugin,
  declareIndexPlugin,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";

async function showDoggo(
  plugin: RNPlugin,
  position?: { top?: number; bottom?: number; left?: number; right?: number },
  classContainer?: string
) {
  await plugin.window.openFloatingWidget(
    "puppy_popup",
    position || { top: 0, bottom: 0, left: 0, right: 0 },
    classContainer
  );
}

async function onActivate(plugin: ReactRNPlugin) {
  // Initialize the seenCards session storage variable.
  // Session storage is like global state for your plugin
  // which can be accessed in your widget components.
  //
  // It is better than a normal global variable in cases
  // where you want to react to changes in the variable's
  // value - components can use the `useSessionStorage`
  // hook to re-render when a session storage variable changes.
  await plugin.storage.setSession("seenCards", 0);

  await plugin.settings.registerNumberSetting({
    id: "cardInterval",
    title: "Number of cards between puppies",
    defaultValue: 10,
  });

  // When the user completes a card, we check if they
  // have seen the number of cards specified in the card
  // interval setting. If so we show the popup.
  plugin.addListener(AppEvents.QueueCompleteCard, undefined, async () => {
    const cardInterval = Number(
      await plugin.settings.getSetting("cardInterval")
    );
    const seenCards: number =
      (await plugin.storage.getSession("seenCards")) + 1;
    await plugin.storage.setSession("seenCards", seenCards);
    if (seenCards % cardInterval === 0) {
      // Opens a floating widget popup 180px above the show answer buttons.
      // The "rn-queue..." string is a classname representing the container
      // around the show answer buttons.
      // We use a small setTimeout delay to make sure the queue and show answer
      // button have finished rendering before trying to show the popup.
      setTimeout(() => {
        showDoggo(plugin, { top: -180 }, "rn-queue__show-answer-btn");
      }, 25);
    }
  });

  // Reset the seen cards counter when the user enters the queue.
  plugin.addListener(AppEvents.QueueEnter, undefined, () => {
    plugin.storage.setSession("seenCards", 0);
  });

  // A test command so you can see how the popup looks.
  await plugin.registerCommand({
    id: "showDoggo",
    name: "Show Doggo",
    action: () => showDoggo(plugin),
  });

  // Register the puppy popup widget component.
  await plugin.registerWidget("puppy_popup", WidgetLocation.FloatingWidget, {
    dimensions: {
      width: 300,
      height: "auto",
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
