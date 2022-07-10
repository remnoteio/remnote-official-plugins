import {
  usePlugin,
  BuiltInPowerupCodes,
  LoadingSpinner,
  useRunAsync,
  WidgetLocation,
  useReactiveAPI,
} from "@remnote/plugin-sdk";
import { WikiExtract } from "../lib/models";
import { useFetch } from "../hooks/useFetch";
import { tryCreateWikiExtractURL } from "../lib/wikipedia";
import { useDebounce } from "../hooks/useDebounce";
import clsx from 'clsx';

interface WikiPopupInterface {
  location: WidgetLocation
  remId: string
}

// Main component used by both the RemReferencePopup widget
// and the FloatingWindow widget.

export function WikiPopup(props: WikiPopupInterface) {
  const plugin = usePlugin();
  const rem = useRunAsync(async () => await plugin.rem.findOne(props.remId), [props.remId]);
  const renderLocation = useReactiveAPI(async (reactivePlugin) => {
    return (await reactivePlugin.settings.getSetting("render-location")) as WidgetLocation
  })

  // Only set the link variable after the rem
  // variable above has not been updated for
  // 0.2 seconds to reduce unnecessary API calls.
  // This should prevent us from getting rate limited
  // by the wikipedia API service.
  const link = useDebounce(
    useRunAsync(
      async () => await rem?.getPowerupProperty(BuiltInPowerupCodes.Link, "URL"), [rem?._id]),
    200
  );

  const { response, isLoading, isError } = useFetch<WikiExtract | null>(
    // If the link is not null, try to create the Wiki extract API
    // URL and request the summary info for the article.
    link ? tryCreateWikiExtractURL(link) : null,
    null
  );

  const body = response?.extract_html;
  const imgSrc = response?.thumbnail?.source;

  if (renderLocation !== props.location) {
    return null;
  }

  const isFloating = renderLocation === WidgetLocation.FloatingWidget 
  return (
    <div className={clsx(isFloating && "p-[3px]")}>
      <div className={clsx("overflow-y-scroll w-full p-4 ", isFloating && "rounded-lg shadow-md border-gray-100")}>
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <p>An error occurred fetching the summary :(</p>
        ) : link && response ? (
          <>
            <div>
              {imgSrc && (
                <img src={imgSrc} className="ml-2 max-w-[180px] object-cover rounded-lg float-right" />
              )}
              <div dangerouslySetInnerHTML={{ __html: body || "" }} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
