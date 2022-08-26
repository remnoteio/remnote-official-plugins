import {
  renderWidget,
  usePlugin,
  useTracker,
  useRunAsync,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import { PaneNumber } from "../components/PaneNumber";

const MultiplePanesPaneNumber = () => {
  const plugin = usePlugin();
  const ctx = useRunAsync(
    async () => await plugin.widget.getWidgetContext<WidgetLocation.PaneHeader>(),
    []
  );
  const currentWindowTree = useTracker(
    async (reactivePlugin) => await reactivePlugin.window.getCurrentWindowTree()
  );
  return <PaneNumber windowTree={currentWindowTree} paneId={ctx?.paneId} />;
};

renderWidget(MultiplePanesPaneNumber);
