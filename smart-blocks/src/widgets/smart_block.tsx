import React from "react";
import {
  renderWidget,
  usePlugin,
  useRunAsync,
  useTracker,
} from "@remnote/plugin-sdk";

function SmartBlock() {
  const plugin = usePlugin();
  const widgetContext = useRunAsync(() => plugin.widget.getWidgetContext(), []);

  // We want to reactively monitor any Rem being referenced.
  const deepRefs = useTracker(async (reactivePlugin) =>  {
    const remId = widgetContext?.remId
    const rem = await reactivePlugin.rem.findOne(remId)
    return await rem?.deepRemsBeingReferenced()
  }, [widgetContext?.remId]);

  // We must now re-fetch our Rem, and add `deepRefs` as a React dependency
  // so we re-fetch whenever we observe that a dependency changes.
  const remText = useTracker(async (reactivePlugin) => {
    const newRem = await reactivePlugin.rem.findOne(widgetContext?.remId)
    return await reactivePlugin.richText.toString(newRem?.text || [])
  }, [deepRefs]);

  console.log(remText)

  let val;
  try {
    val = eval(remText || "");
  } catch {}

  return val != undefined && "" + val != remText?.trim() ? (
    <div className="text-blue-500 ml-10">= {val}</div>
  ) : null;
}

renderWidget(SmartBlock);
