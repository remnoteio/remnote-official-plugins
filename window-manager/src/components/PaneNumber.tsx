import {useSessionStorageState, PaneRemWindowTree} from "@remnote/plugin-sdk";
import {isAbsoluteFocusModeStorageKey} from "../lib/constants";
import {getAllPaneRemIds} from "../lib/windowTreeUtils";

interface PaneNumberProps {
  paneId: string | undefined
  windowTree: PaneRemWindowTree | undefined;
}

export const PaneNumber = (props: PaneNumberProps) => {
  const [isAbsoluteFocusMode] = useSessionStorageState(isAbsoluteFocusModeStorageKey, false)
  const allPaneRems = props.windowTree ? getAllPaneRemIds(props.windowTree) : [];
  const paneIdx = props.paneId ? allPaneRems.findIndex(x => x.paneId === props.paneId) : -1;
  return (paneIdx !== -1 && isAbsoluteFocusMode)
    ? <div className="border border-gray-90 rounded px-1 text-xs mr-0.5 font-semibold">{paneIdx + 1}</div>
    : null;
};
