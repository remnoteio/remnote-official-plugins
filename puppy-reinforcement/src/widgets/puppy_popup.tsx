import {
  AppEvents,
  renderWidget,
  useAPIEventListener,
  usePlugin,
  useSessionStorageState,
} from "@remnote/plugin-sdk";
import { randomDoggo } from "../lib/doggos";
import { randomMotivation } from "../lib/motivation";

function PuppyPopup() {
  const plugin = usePlugin();
  const src = randomDoggo();
  // Get the seenCards value from session storage
  const [seenCards] = useSessionStorageState("seenCards", 0);

  useAPIEventListener(AppEvents.QueueCompleteCard, undefined, async () => {
    const { floatingWidgetId } = await plugin.getWidgetContext();
    await plugin.window.closeFloatingWidget(floatingWidgetId);
  });

  return (
    <>
      {
        <div
          onClick={async () => {
            // Access the "widget context" for the current widget.
            // The widget context for widgets positioned in floating
            // widgets contains the floatingWidgetId which we can use
            // to close the widget when the user clicks on the popup.
            const { floatingWidgetId } = await plugin.getWidgetContext();
            await plugin.window.closeFloatingWidget(floatingWidgetId);
          }}
          className="cursor-pointer rounded-md border border-solid grid gap-1 grid-cols-2 rn-clr-background-primary rn-clr-content-primary"
        >
          <img src={src} className="max-h-[200px] w-auto rounded-l-md" />
          <div className="flex text-center text-lg items-center pr-2">
            Wow! {seenCards} cards done! {randomMotivation()}!
          </div>
        </div>
      }
    </>
  );
}

renderWidget(PuppyPopup);
