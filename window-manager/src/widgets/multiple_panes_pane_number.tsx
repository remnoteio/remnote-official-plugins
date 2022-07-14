import {
  renderWidget,
  usePlugin,
  useTracker,
  useRunAsync,
} from "@remnote/plugin-sdk";
import { PaneNumber } from "../components/PaneNumber";

const MultiplePanesPaneNumber = () => {
  const plugin = usePlugin();
  const ctx = useRunAsync(
    async () => await plugin.widget.getWidgetContext(),
    []
  );
  const currentWindowTree = useTracker(
    async (reactivePlugin) => await reactivePlugin.window.getCurrentWindowTree()
  );
  return <PaneNumber windowTree={currentWindowTree} paneId={ctx?.paneId} />;
};

renderWidget(MultiplePanesPaneNumber);
