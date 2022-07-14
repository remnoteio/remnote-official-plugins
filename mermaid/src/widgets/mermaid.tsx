import {
  usePlugin,
  renderWidget,
  AppEvents,
  useRunAPIMethod,
  useAPIEventListener,
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

  const widgetContext = useRunAPIMethod(plugin.getWidgetContext, []);

  const getRemText = async (remId: string) => {
    const rem = await plugin.rem.findOne(remId);

    const text = await plugin.richText.toString(rem?.text || []);
    return text?.toString() || "";
  };

  const renderMermaid = async () => {
    const remId = widgetContext?.remId;
    const text = await getRemText(remId);
    if (text) {
      try {
        mermaid.render(id + "mermaid_widget", text, (svgCode: string) => {
          const elem = document.getElementById(id + "mermaid_widget_renderer");
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
    const callback = () => {
      // TODO: add debounce
      setTimeout(async () => {
        const remId = widgetContext?.remId;
        renderMermaid();
      }, 500);
    };
    plugin.addListener(AppEvents.EditorTextEdited, undefined, callback);

    renderMermaid();

    return () =>
      plugin.removeListener(AppEvents.EditorTextEdited, undefined, callback);
  }, [widgetContext, id]);
  return (
    <div>
      <div id={id + MERMAID_WIDGET} />
      <div id={id + MERMAID_WIDGET_RENDERER} />
    </div>
  );
};

renderWidget(MermaidWidget);
