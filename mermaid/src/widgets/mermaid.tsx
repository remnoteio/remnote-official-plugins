import {
  usePlugin,
  renderWidget,
  AppEvents,
  useAPIEventListener,
  useRunAsync,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { nanoid } from "nanoid";
import { debounce } from "debounce";

const MERMAID_WIDGET = "mermaid_widget";
const MERMAID_WIDGET_RENDERER = "mermaid_widget_renderer";

export const MermaidWidget = () => {
  const plugin = usePlugin();
  const [id] = useState(nanoid());

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
      try {
        mermaid.render(id + MERMAID_WIDGET, text, (svgCode: string) => {
          const elem = document.getElementById(id + MERMAID_WIDGET_RENDERER);
          if (elem) {
            elem.innerHTML = svgCode;
          }
        });
      } catch (error) {}
    }
  };

  useAPIEventListener(
    AppEvents.RemChanged,
    widgetContext?.remId,
    debounce(() => renderMermaid(), 500)
  );

  useEffect(() => {
    renderMermaid()
  }, [widgetContext?.remId])

  return (
    <div>
      <div id={id + MERMAID_WIDGET} />
      <div id={id + MERMAID_WIDGET_RENDERER} />
    </div>
  );
};

renderWidget(MermaidWidget);
