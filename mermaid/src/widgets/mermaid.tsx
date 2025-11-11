import {
  usePlugin,
  renderWidget,
  AppEvents,
  useAPIEventListener,
  useRunAsync,
  type WidgetLocation,
} from "@remnote/plugin-sdk";
import { useEffect, useState, useRef, useCallback } from "react";
import mermaid from "mermaid";
import { debounce } from "debounce";
import { nanoid } from "nanoid";

const MERMAID_WIDGET = "mermaid_widget";
const MERMAID_WIDGET_RENDERER = "mermaid_widget_renderer";

export const MermaidWidget = () => {
  const plugin = usePlugin();
  const [id] = useState(nanoid());

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<HTMLDivElement | null>(null);

  // Initialize mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  const widgetContext = useRunAsync(() => plugin.widget.getWidgetContext<WidgetLocation.UnderRemEditor>(), []);

  const getRemText = useCallback(
    async (remId: string) => {
      const rem = await plugin.rem.findOne(remId);
      const text = await plugin.richText.toString(rem?.text || []);
      return text?.toString() || "";
    },
    [plugin]
  );

  const renderMermaid = useCallback(async () => {
    const remId = widgetContext?.remId;
    const text = remId && (await getRemText(remId));
    if (text && rendererRef.current) {
      try {
        const { svg } = await mermaid.render(MERMAID_WIDGET + id, text);
        rendererRef.current.innerHTML = svg;
      } catch (e) {
        console.log("Mermaid failed to render: ", e);
      }
    }
  }, [widgetContext?.remId, id, getRemText]);

  useAPIEventListener(
    AppEvents.RemChanged,
    widgetContext?.remId,
    debounce(() => renderMermaid(), 500)
  );

  useEffect(() => {
    if (widgetContext?.remId && widgetRef.current && rendererRef.current) {
      renderMermaid();
    }
  }, [widgetContext?.remId, renderMermaid]);

  return (
    <div>
      {/* className="border-2 border-stone-200 dark:border-stone-600 rounded p-2 ml-6" */}
      <div ref={widgetRef} id={MERMAID_WIDGET + id} />
      <div ref={rendererRef} id={MERMAID_WIDGET_RENDERER + id} />
    </div>
  );
};

renderWidget(MermaidWidget);
