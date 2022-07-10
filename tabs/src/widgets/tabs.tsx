import {
  AppEvents,
  filterAsync,
  Rem,
  RemRichTextEditor,
  RemType,
  renderWidget,
  RNPlugin,
  useAPIEventListener,
  usePlugin,
  useReactiveAPI,
} from "@remnote/plugin-sdk";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { Container, Draggable } from "react-smooth-dnd";
import { paneRemTreeToRemTree } from "../lib/utils";
import { getOrCreateHomeWorkspace, HOME_TAB_NAME } from "../shared";

function TabsBar() {
  const plugin = usePlugin();
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const [draggingId, setDraggingId] = React.useState<string | undefined>();

  const workspacePowerup = useReactiveAPI(async (reactivePlugin: RNPlugin) => {
    return await reactivePlugin.powerup.getPowerupByCode("workspace");
  }, []);

  // Reactively get the tabs
  const reactiveTabs = useReactiveAPI(async (reactivePlugin) => {
    const workspacePowerup = await reactivePlugin.powerup.getPowerupByCode(
      "workspace"
    );
    const children = (await workspacePowerup?.getChildrenRem()) || [];

    return await filterAsync(children, async (c) => {
      return (
        c.type != RemType.PORTAL &&
        workspacePowerup &&
        (await c.hasPowerup("workspace"))
      );
    });
  }, []) || []

  // Cache the tabs in React state to reduce jitter when the user drags a tab
  const [tabs, setTabs] = useState(reactiveTabs);
  useEffect(() => {
    const homeTab = reactiveTabs?.find((t) => t.text[0] == HOME_TAB_NAME);
    const nonHomeTabs = reactiveTabs?.filter((t) => t.text[0] != HOME_TAB_NAME);

    setTabs([homeTab!, ...(nonHomeTabs || [])].filter((i) => i));
  }, [reactiveTabs?.length]);

  const currentTab = tabs?.[tabIndex];

  const addTab = async () => {
    const index = tabs?.length;
    const newRem = (await plugin.rem.createRem())!;
    await setPowerupPropertiesForCurrentWindow(newRem);

    await newRem.addTag(workspacePowerup?._id || "");
    await newRem.setParent(workspacePowerup?._id || "", 9999999);

    setTabIndex(index);
  };

  const findOpenTab = async () => {
    if (tabs) {
      const currentRemTree = JSON.stringify(
        await plugin.window.getCurrentWindowTree()
      );
      const openIndex = (
        await Promise.all(
          tabs.map(
            async (t) => await t.getPowerupProperty("workspace", "windowTree")
          )
        )
      ).findIndex((url) => url == currentRemTree);
      setTabIndex(openIndex);
    }
  };

  useAPIEventListener(
    AppEvents.ClickRemReference,
    "workspace",
    async (data) => {
      const tabIndex = tabs?.findIndex((t) => t._id == data.remId);
      if (tabIndex !== undefined) {
        onClickTab(tabIndex);
      }
    }
  );

  useEffect(() => {
    findOpenTab();
  }, [!!tabs]);

  const onURLChange = async () => {
    if (currentTab)
      await setPowerupPropertiesForCurrentWindow(currentTab);
  };

  useAPIEventListener(AppEvents.ClickSidebarItem, "home", async () => {
    setTabIndex(0);
    const homeWorkspace = await getOrCreateHomeWorkspace(plugin);
    await homeWorkspace?.openRemInContext();
  });

  const setPowerupPropertiesForCurrentWindow = async (tabPlugin: Rem) => {
    const tree = await plugin.window.getCurrentWindowTree();
    const remTree = JSON.stringify(paneRemTreeToRemTree(tree));
    const openRemIds = await plugin.window.getOpenPaneRemIds();

    tabPlugin?.setPowerupProperty("workspace", "windowTree", [remTree]);
    tabPlugin?.setPowerupProperty(
      "workspace",
      "remIds",
      openRemIds.map((_id) => ({
        i: "q",
        _id,
      }))
    );
  };

  useAPIEventListener(AppEvents.URLChange, undefined, onURLChange);

  const onClickTab = async (index: number) => {
    setTabIndex(index);
    setTimeout(async () => {
      if (index == 0) {
        const todaysDoc = await plugin.date.getTodaysDoc();
        if (todaysDoc) {
          await plugin.window.setRemWindowTree(todaysDoc?._id);
        }
      } else {
        const tabRem = tabs[index];
        try {
          const tree = JSON.parse(
            await tabRem?.getPowerupProperty("workspace", "windowTree")
          );
          if (tree) {
            plugin.window.setRemWindowTree(tree);
          }
        } catch (e) {
          console.log("Failed to parse JSON windowTree");
        }
      }
    }, 100);
  };

  const deleteTab = async (event: any, index: number) => {
    const tabRem = tabs[index];
    await tabRem?.remove();

    if (index >= tabs.length) {
      await onClickTab(index - 1);
      setTabIndex(index - 1);
    } else {
      await onClickTab(index + 1);
      setTabIndex(index);
    }

    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div
      className={clsx(
        "overflow-x-auto overflow-y-hidden",
        "rn-clr-background-secondary",
        "flex gap-1 items-stretch",
        "p-1 py-0 pl-4"
      )}
    >
      {tabs?.[0] && (
        <Tab
          isDragging={false}
          tabRem={tabs?.[0]}
          index={0}
          key={tabs[0]?._id}
          isSelected={0 == tabIndex}
          onClick={onClickTab}
        />
      )}
      <Container
        lockAxis="x"
        getChildPayload={(idx) => tabs[idx + 1]}
        onDragStart={(e) => setDraggingId(e.payload._id)}
        orientation="horizontal"
        onDrop={async (e) => {
          // Immediately optimistiaclly re-render
          const newTabs = tabs.slice(1);
          const moved = newTabs[e.removedIndex!];
          if (e.addedIndex! > e.removedIndex!) {
            newTabs.splice(e.addedIndex! + 1, 0, moved);
            newTabs.splice(e.removedIndex!, 1);
          } else {
            newTabs.splice(e.removedIndex!, 1);
            newTabs.splice(e.addedIndex!, 0, moved);
          }
          setTabs([tabs[0], ...newTabs]);

          // Move for real
          const rem = tabs[e.removedIndex! + 1];

          const powerupChildren = await workspacePowerup!.getChildrenRem();

          const dropIndex =
            e.addedIndex! >= tabs.length
              ? powerupChildren.length + 1
              : powerupChildren
                  .map((q) => q._id)
                  .indexOf(tabs[e.addedIndex! + 1]._id);

          const parent = rem.parent;
          if (
            powerupChildren.map((x) => x._id).indexOf(rem._id) !== dropIndex
          ) {
            await rem.setParent(
              parent,
              e.addedIndex! > e.removedIndex! ? dropIndex + 1 : dropIndex
            );
          }

          if (tabIndex === e.removedIndex! + 1) {
            setTabIndex(e.addedIndex! + 1);
          }

          if (e.addedIndex! + 1 <= tabIndex && e.removedIndex! + 1 > tabIndex) {
            setTabIndex(tabIndex + 1);
          } else if (
            e.addedIndex! + 1 >= tabIndex &&
            e.removedIndex! + 1 < tabIndex
          ) {
            setTabIndex(tabIndex - 1);
          }

          // Stop dragging
          setDraggingId(undefined);
        }}
      >
        {tabs?.slice(1).map((tabRem, index) => (
          <Draggable key={tabRem._id}>
            <Tab
              isDragging={draggingId === tabRem._id}
              setDraggingId={setDraggingId}
              tabRem={tabRem}
              index={index + 1}
              key={tabRem._id}
              isSelected={index + 1 == tabIndex}
              deleteTab={deleteTab}
              onClick={onClickTab}
            />
          </Draggable>
        ))}
      </Container>
      <TabPlusButton addTab={addTab} />
    </div>
  );
}

interface TabProps {
  tabRem: Rem;
  index: number;
  isSelected: boolean;
  deleteTab?: (event: any, index: number) => void;
  onClick: (index: number, tabRem: Rem | undefined) => void;
  isDragging: boolean;
  setDraggingId?: (id: string | undefined) => void;
}

function Tab(props: TabProps) {
  const plugin = usePlugin();

  const tabRem = useReactiveAPI(
    async (reactivePlugin) => {
      return await reactivePlugin.rem.findOne(props.tabRem._id);
    },
    [props.tabRem._id]
  );

  return (
    <div
      onMouseDown={() =>
        props.setDraggingId && props.setDraggingId(props.tabRem._id)
      }
      onMouseUp={() => props.setDraggingId && props.setDraggingId(undefined)}
      className={clsx(
        "h-[50px] box-border",
        "cursor-pointer",
        "border-solid border-b-0 border-t-0 border-[0.5px] rn-clr-border-state-disabled",
        props.isSelected
          ? "rn-clr-background-primary"
          : "rn-clr-background-secondary",
        "mb-[-1px] pl-4 pr-1 py-[8px] p-1 ",
        "min-w-[50px] ",
        "!whitespace-nowrap",
        "flex items-center flex-row flex-shrink-0 flex-grow-0"
      )}
      onClick={() => {
        props.onClick(props.index, tabRem);
      }}
    >
      {!props.isDragging ? (
        <div onMouseDown={(e) => e.stopPropagation()}>
          <RemRichTextEditor
            width="expand"
            remId={tabRem?._id}
            singleLine
            readOnly={!props.isSelected}
            className={clsx(
              !props.isSelected &&
                "cursor-pointer pointer-events-none !whitespace-nowrap"
            )}
          />
        </div>
      ) : (
        <div
          onMouseUp={(e) => e.stopPropagation()}
          className={clsx("font-inter text-md !whitespace-nowrap", tabRem?.text.length === 0 && "italic")}
        >
          {tabRem?.text.length === 0 ? "Untitled" : tabRem?.text.filter((e) => typeof e == "string")}
        </div>
      )}
      {/* This renders the number of open windows in the tab: */}
      {/* {!!remIds && remIds.length > 1 && (
        <span className="text-gray-600 ml-1">({remIds?.length})</span>
      )} */}
      {props.deleteTab ? (
        <span
          onClick={(event) => {
            props.deleteTab && props.deleteTab(event, props.index);
            event.preventDefault();
            event.stopPropagation();
          }}
          className="mx-2 p-1 rounded-sm items-center justify-center hover:rn-clr-background--hovered flex rn-clr-content-primary"
        >
          <img
            src={`${plugin.rootURL}close.svg`}
            style={{
              display: "inline-block",
              fill: "color",
              color: "color",
              width: 12,
              height: 12,
            }}
          />
        </span>
      ) : (
        <div className="mr-2" />
      )}
    </div>
  );
}

function TabPlusButton(props) {
  const plugin = usePlugin();
  return (
    <div
      className="p-2 flex items-center cursor-pointer"
      onClick={props.addTab}
    >
      <div className="flex items-center w-6 h-6 justify-center p-1 rounded-md text-center hover:rn-clr-background--hovered">
        <img
          src={`${plugin.rootURL}add.svg`}
          style={{
            display: "inline-block",
            fill: "color",
            color: "color",
            width: "auto",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}

renderWidget(TabsBar);
