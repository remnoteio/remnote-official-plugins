import {
  AppEvents,
  filterAsync,
  Rem,
  RemType,
  renderWidget,
  RNPlugin,
  useAPIEventListener,
  usePlugin,
  useTracker,
  RemIdWindowTree,
  useSessionStorageState,
} from "@remnote/plugin-sdk";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { Container, Draggable } from "react-smooth-dnd";
import {
  paneRemTreeToRemTree,
  useDebounce,
  removeDeletedRem,
} from "../lib/utils";
import { getOrCreateHomeWorkspace, HOME_TAB_NAME } from "../shared";
import AutosizeInput from "react-input-autosize";
import deepEqual from "deep-equal";
import { focusedTabIndexKey, tabsKey } from "../lib/consts";

function TabsBar() {
  const plugin = usePlugin();
  const [tabIndex, setTabIndex] = useSessionStorageState(focusedTabIndexKey, 0);

  const workspacePowerup = useTracker(async (reactivePlugin: RNPlugin) => {
    return await reactivePlugin.powerup.getPowerupByCode("workspace");
  }, []);

  // Reactively get the tabs
  const reactiveTabs =
    useTracker(async (reactivePlugin) => {
      const workspacePowerup = await reactivePlugin.powerup.getPowerupByCode(
        "workspace"
      );
      const children = (await workspacePowerup?.getChildrenRem()) || [];

      return await filterAsync(children, async (c) => {
        return !!(
          c.type != RemType.PORTAL &&
          workspacePowerup &&
          (await c.hasPowerup("workspace"))
        );
      });
    }, []) || [];

  // Cache the tabs in React state to reduce jitter when the user drags a tab
  const [tabs, setTabs] = useSessionStorageState(tabsKey, reactiveTabs);
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
    if (tabs.length > 1) {
      const currentRemTree = paneRemTreeToRemTree(
        await plugin.window.getCurrentWindowTree()
      );
      const tabTrees = await Promise.all(
        tabs.map(async (t) => {
          try {
            if (t.text[0] == HOME_TAB_NAME) {
              return (await plugin.date.getTodaysDoc())?._id;
            } else {
              const tree = JSON.parse(
                await t.getPowerupProperty("workspace", "windowTree")
              ) as RemIdWindowTree;
              const withoutDeletedDocs = await removeDeletedRem(plugin, tree);
              return withoutDeletedDocs;
            }
          } catch (e) {}
        })
      );
      const openIndex = tabTrees.findIndex((remTree) =>
        deepEqual(remTree, currentRemTree)
      );
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
  }, [tabs.length > 1]);

  const onURLChange = async () => {
    if (currentTab) await setPowerupPropertiesForCurrentWindow(currentTab);
  };

  useAPIEventListener(AppEvents.ClickSidebarItem, "home", async () => {
    setTabIndex(0);
    const homeWorkspace = await getOrCreateHomeWorkspace(plugin);
    await homeWorkspace?.openRemInContext();
  });

  const setPowerupPropertiesForCurrentWindow = async (tabPlugin: Rem) => {
    const tree = await plugin.window.getCurrentWindowTree();
    const remTree = JSON.stringify(paneRemTreeToRemTree(tree));
    tabPlugin?.setPowerupProperty("workspace", "windowTree", [remTree]);
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
          if (!tree) {
            return;
          }
          const withoutDeletedDocs = await removeDeletedRem(
            plugin,
            tree as RemIdWindowTree
          );
          const newTree = withoutDeletedDocs
            ? withoutDeletedDocs
            : (await plugin.date.getTodaysDoc())?._id;
          if (!newTree) {
            return;
          }
          plugin.window.setRemWindowTree(newTree);
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
        }}
      >
        {tabs?.slice(1).map((tabRem, index) => (
          <Draggable key={tabRem._id}>
            <Tab
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
}

function Tab(props: TabProps) {
  const plugin = usePlugin();
  const [value, setValue] = useState<string>();
  useEffect(() => {
    const eff = async () => {
      setValue(await plugin.richText.toString(props.tabRem.text));
    };
    eff();
  }, []);

  const debouncedValue = useDebounce(value, 200);
  useEffect(() => {
    const eff = async () => {
      if (debouncedValue === undefined) return;
      await props.tabRem.setText([debouncedValue]);
    };
    eff();
  }, [debouncedValue]);

  return (
    <div
      onMouseUp={() => props.onClick(props.index, props.tabRem)}
      className={clsx(
        "h-[50px] box-border",
        "cursor-pointer",
        "border-solid border-b-0 border-t-0 border-[0.5px] rn-clr-border-state-disabled",
        props.isSelected
          ? "rn-clr-background-primary"
          : "rn-clr-background-secondary",
        "flex items-center justify-between gap-2 py-2",
        props.index == 0 ? "px-4" : "pl-4 pr-3",
        "min-w-[50px] ",
        "!whitespace-nowrap",
        "flex items-center flex-row flex-shrink-0 flex-grow-0",
        !props.isSelected && "cursor-pointer !whitespace-nowrap"
      )}
    >
      {props.index === 0 ? (
        <span
          className={clsx(
            !props.isSelected && "cursor-pointer !whitespace-nowrap"
          )}
        >
          {value}
        </span>
      ) : (
        <AutosizeInput
          value={value}
          placeholder={"Untitled"}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setValue(e.target.value)}
          minWidth={50}
          className="text-md"
          inputClassName={clsx(
            "text-md focus:outline-none border-0 border-transparent focus:border-transparent focus:ring-0 min-w-[50px]",
            props.isSelected
              ? "rn-clr-background-primary"
              : "rn-clr-background-secondary",
            !props.isSelected && "cursor-pointer !whitespace-nowrap"
          )}
        />
      )}
      {/* This renders the number of open windows in the tab: */}
      {/* {!!remIds && remIds.length > 1 && (
        <span className="ml-1 text-gray-600">({remIds?.length})</span>
      )} */}
      {props.deleteTab && (
        <span
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            props.deleteTab && props.deleteTab(event, props.index);
          }}
          className="p-0.5 w-[10px] rounded-sm items-center justify-center hover:rn-clr-background--hovered flex rn-clr-content-primary"
        >
          <img
            alt="Close tab"
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
      )}
    </div>
  );
}

function TabPlusButton(props) {
  const plugin = usePlugin();
  return (
    <div
      className="flex items-center p-1 cursor-pointer"
      onClick={props.addTab}
    >
      <div className="flex items-center justify-center w-6 h-6 text-center rounded-md hover:rn-clr-background--hovered">
        <img
          alt="Add tab"
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
