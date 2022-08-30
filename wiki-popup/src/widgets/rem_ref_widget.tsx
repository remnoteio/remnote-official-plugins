import { WikiPopup } from "../components/wiki_popup";
import {
  WidgetLocation,
  renderWidget,
  useRunAsync,
  usePlugin,
} from "@remnote/plugin-sdk";

function FloatingWikiPopup() {
  const plugin = usePlugin();
  // The WidgetContext is an object containing data specific
  // to the type of widget. In this case we want to access
  // the remId of the link the user has right clicked on.
  const remId = useRunAsync(async () => {
    const ctx = await plugin.widget.getWidgetContext<WidgetLocation.RemReferencePopupRight>();
    return ctx?.remId;
  }, [])!;
  return (
    <WikiPopup remId={remId} location={WidgetLocation.RemReferencePopupRight} />
  );
}

renderWidget(FloatingWikiPopup);
