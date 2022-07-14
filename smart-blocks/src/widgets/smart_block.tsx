import React from "react";
import {
  renderWidget,
  useGetRemsByIdsReactive,
  usePlugin,
  useRunAPIMethod,
  useRunAPIMethodReactive,
} from "@remnote/plugin-sdk";

function SmartBlock() {
  // Find our source Rem
  const plugin = usePlugin();
  const widgetContext = useRunAPIMethod(plugin.getWidgetContext, []);

  const findRem = React.useCallback(
    async (remId?: string | undefined) =>
      remId ? await plugin.rem.findOne(remId) : undefined,
    []
  );
  const rem = useRunAPIMethodReactive(findRem, [], widgetContext?.remId);

  // We want to reactively monitor any Rem being referenced. We
  // fetch them, and then call useGetRemsByIdsReactive to reactively watch them.
  const deepRefIds = useRunAPIMethod(rem?.deepRemsBeingReferenced, [rem])?.map(
    (q) => q._id
  );

  const deepRefs = useGetRemsByIdsReactive(deepRefIds);

  // We must now re-fetch our Rem, and add `deepRefs` as a React dependency
  // so we re-fetch whenever we observe that a dependency changes.
  const newRem = useRunAPIMethodReactive(
    findRem,
    [deepRefs],
    widgetContext?.remId
  );
  const remText = useRunAPIMethod(
    plugin.richText.toString,
    [deepRefs],
    newRem?.text || []
  );

  let val;
  try {
    val = eval(remText || "");
  } catch {}

  return val != undefined && "" + val != remText?.trim() ? (
    <div className="text-blue-500 ml-10">= {val}</div>
  ) : null;
}

renderWidget(SmartBlock);
