import {
  usePlugin,
  renderWidget,
  AppEvents,
  useAPIEventListener,
  useRunAsync,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";
import { debounce } from "debounce";
import {nanoid} from 'nanoid';

const MERMAID_WIDGET = "mermaid_widget";
const MERMAID_WIDGET_RENDERER = "mermaid_widget_renderer";

export const MermaidWidget = () => {
  const plugin = usePlugin();
  const [id] = useState(nanoid())

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<HTMLDivElement | null>(null);

  const widgetContext = useRunAsync(() => plugin.widget.getWidgetContext<WidgetLocation.UnderRemEditor>(), []);

  const getRemText = async (remId: string) => {
    const rem = await plugin.rem.findOne(remId);
    const text = await plugin.richText.toString(rem?.text || []);
    return text?.toString() || "";
  };

  const renderMermaid = async () => {
    const remId = widgetContext?.remId;
    const text = remId && await getRemText(remId);
    if (text) {
      mermaid.render(MERMAID_WIDGET + id, text, (svgCode: string) => {
        rendererRef.current!.innerHTML = svgCode;
      });
    }
  };

  useAPIEventListener(
    AppEvents.RemChanged,
    widgetContext?.remId,
    debounce(() => renderMermaid(), 500)
  );

  useEffect(() => {
    if (widgetContext?.remId && widgetRef.current && rendererRef.current) {
      renderMermaid();
    }
  }, [widgetContext?.remId, widgetRef.current, rendererRef.current])

  return (
    <div>
      <div ref={widgetRef} id={MERMAID_WIDGET + id} />
      <div ref={rendererRef} id={MERMAID_WIDGET_RENDERER + id} />
    </div>
  );
};

renderWidget(MermaidWidget);
