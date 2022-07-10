import React, { useEffect } from "react";
import {
  RemHierarchyEditorTree,
  RemId,
  RemViewer,
  renderWidget,
  usePlugin,
  useSyncedStorageState,
} from "@remnote/plugin-sdk";
import { timeSince } from "../lib/utils";

const NUM_TO_LOAD_IN_BATCH = 20;
interface HistoryData {
  key: number;
  remId: RemId;
  open: boolean;
  time: number;
}

function RightSidebar2() {
  const [remData, setRemData] = useSyncedStorageState<HistoryData[]>(
    "remData",
    []
  );

  const closeIndex = (index: number) => {
    remData.splice(index, 1);
    setRemData(remData);
  };

  const setData = (index: number, changes: Partial<HistoryData>) => {
    const oldData = remData[index];
    const newData = { ...oldData, ...changes };
    remData.splice(index, 1, newData);
    setRemData(remData);
  };

  const [numLoaded, setNumLoaded] = React.useState(1);

  useEffect(() => {
    setNumLoaded(1);
  }, [remData.length]);

  const numUnloaded = Math.max(
    0,
    remData.length - NUM_TO_LOAD_IN_BATCH * numLoaded
  );

  return (
    <div
      className="h-full overflow-y-auto rn-clr-background-primary"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {remData.length == 0 && (
        <div className="rn-clr-content-primary">
          Navigate to other documents to automatically record history.
        </div>
      )}
      {remData.slice(0, NUM_TO_LOAD_IN_BATCH * numLoaded).map((data, i) => (
        <RemHistoryItem
          data={data}
          remId={data.remId}
          key={data.key || Math.random()}
          setData={(c) => setData(i, c)}
          closeIndex={() => closeIndex(i)}
        />
      ))}
      {numUnloaded > 0 && (
        <div
          onMouseOver={() => setNumLoaded((i) => i + 1)}
          className="pb-[200px]"
        >
          {" "}
          Load more{" "}
          <span className="rn-clr-content-secondary">({numUnloaded})</span>
        </div>
      )}
    </div>
  );
}

interface RemHistoryItemProps {
  data: HistoryData;
  remId: string;
  setData: (changes: Partial<HistoryData>) => void;
  closeIndex: () => void;
}

function RemHistoryItem({
  data,
  remId,
  setData,
  closeIndex,
}: RemHistoryItemProps) {
  const plugin = usePlugin();

  const openRem = async (remId: RemId) => {
    const rem = await plugin.rem.findOne(remId);
    if (rem) {
      plugin.window.openRem(rem);
    }
  };

  return (
    <div className="px-1 py-4" key={remId}>
      <div className="flex gap-2 mb-2">
        <div
          className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-md cursor-pointer hover:rn-clr-background--hovered"
          onClick={() => setData({ open: !data.open })}
        >
          <img
            src={`${plugin.rootURL}chevron_down.svg`}
            style={{
              transform: `rotate(${data.open ? 0 : -90}deg)`,
              transitionProperty: "transform",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDuration: "150ms",
            }}
          />
        </div>
        {/* min-w-0 prevents overflow */}
        <div className="flex-grow min-w-0" onClick={() => openRem(remId)}>
          <RemViewer
            remId={remId}
            constraintRef="parent"
            maxWidth="100%"
            className="font-semibold cursor-pointer line-clamp-2"
          />
          <div className="text-xs rn-clr-content-tertiary">
            {timeSince(new Date(data.time))}
          </div>
        </div>
        <div
          className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-md cursor-pointer hover:rn-clr-background--hovered"
          onClick={closeIndex}
        >
          <img
            src={`${plugin.rootURL}close.svg`}
            style={{
              display: "inline-block",
              fill: "var(--rn-clr-content-tertiary)",
              color: "color",
              width: 16,
              height: 16,
            }}
          />
        </div>
      </div>
      {data.open && (
        <div className="m-2" style={{ borderBottomWidth: 1 }}>
          <RemHierarchyEditorTree height="expand" width="300px" remId={remId} />
        </div>
      )}
    </div>
  );
}

renderWidget(RightSidebar2);
