import {WikiPopup} from "../components/wiki_popup";
import {WidgetLocation, renderWidget, useRunAsync, usePlugin } from "@remnote/plugin-sdk";
import {remIdKey} from "../lib/constants";

function FloatingWikiPopup() {
  const plugin = usePlugin()
  const remId = useRunAsync(async () => await plugin.storage.getSession(remIdKey), [])
  return <WikiPopup remId={remId} location={WidgetLocation.FloatingWidget} />
}

renderWidget(FloatingWikiPopup)
