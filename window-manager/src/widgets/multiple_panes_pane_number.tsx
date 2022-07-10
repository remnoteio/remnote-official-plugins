import {
  renderWidget,
  usePlugin,
  useReactiveAPI,
  useRunAsync,
} from "@remnote/plugin-sdk";
import {PaneNumber} from "../components/PaneNumber";

const MultiplePanesPaneNumber = () => {
  const plugin = usePlugin();
  const ctx = useRunAsync(async () => await plugin.getWidgetContext(), []);
  const currentWindowTree = useReactiveAPI(async (reactivePlugin) =>
    await reactivePlugin.window.getCurrentWindowTree()
  );
  return <PaneNumber windowTree={currentWindowTree} paneId={ctx?.paneId}/>
}

renderWidget(MultiplePanesPaneNumber);
