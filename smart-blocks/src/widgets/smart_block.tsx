import React from "react";
import {
  AppEvents,
  renderWidget,
  useAPIEventListener,
  usePlugin,
  useRunAsync,
} from "@remnote/plugin-sdk";

const { useState, useEffect } = React;

function SmartBlock() {
  const [text, setText] = useState("");
  const plugin = usePlugin();
  const widgetContext = useRunAsync(() => plugin.widget.getWidgetContext(), []);

  const getRemText = async (remId: string) => {
    const rem = await plugin.rem.findOne(remId);
    const text = await plugin.richText.toString(rem?.text || []);
    return text?.toString() || "";
  };

  const renderText = async () => {
    const remId = widgetContext?.remId;
    const text = await getRemText(remId);
    setText(text);
  };

  useAPIEventListener(AppEvents.RemChanged, widgetContext?.remId, () =>
    renderText()
  );

  useEffect(() => {
    renderText();
  }, [widgetContext?.remId]);

  let val;
  try {
    val = eval(text || "");
  } catch {}

  return val != undefined && "" + val != text?.trim() ? (
    <div className="ml-10 text-blue-500">= {val}</div>
  ) : null;
}

renderWidget(SmartBlock);
