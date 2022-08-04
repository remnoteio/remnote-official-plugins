import {
  renderWidget,
  Rem,
  BuiltInPowerupCodes,
  RemType,
  SetRemType,
} from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";
import {sleep} from "../lib/utils";

const remObjectMethodTests: TestResultMap<Rem> = {
  removeTag: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const tag = await plugin.rem.createRem();
    await tag?.setText(['tag']);
    await rem?.addTag(tag?._id!);
    await rem?.removeTag(tag?._id!)
    const actual = ((await rem?.getTagRems()) || []).map(x => x._id).includes(tag?._id!);
    const expected = false;
    await removeRem(rem, tag);
    return {
      actual,
      expected,
    }
  },
  removePowerup: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.addPowerup(BuiltInPowerupCodes.Todo);
    await rem?.removePowerup(BuiltInPowerupCodes.Todo);
    await sleep(100);
    const actual = await rem?.hasPowerup(BuiltInPowerupCodes.Todo);
    const expected = false;
    await removeRem(rem);
    return {
      actual,
      expected
    }
  },
  setPracticeDirection: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPracticeDirection("both");
    const actual = await rem?.getPracticeDirection();
    await removeRem(rem);
    return {
      expected: "both",
      actual,
    };
  },
  isPowerupProperty: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.addPowerup(BuiltInPowerupCodes.Todo);
    await rem?.setTodoStatus("Finished")
    const child = (await rem?.getChildrenRem())?.[0]
    const actual = await child?.isPowerupProperty();
    const expected = true;
    await removeRem(rem)
    return {
      expected,
      actual,
    }
  },
  isPowerupPropertyListItem: async (plugin, removeRem) => {
    return {
      expected: "ignore",
      actual: "ignore",
    }
  },
  isPowerupSlot: async (plugin) => {
    const powerup = await plugin.powerup.getPowerupSlotByCode(BuiltInPowerupCodes.Todo, "Status");
    const actual = await powerup?.isPowerupSlot();
    const expected = true;
    return {
      expected,
      actual,
    }
  },
  allRemInDocumentOrPortal: async (plugin, removeRem) => {
    const p = await plugin.rem.createPortal();
    const rem = await plugin.rem.createRem();
    await rem?.addToPortal(p?._id!);
    const actual = ((await p?.allRemInDocumentOrPortal()) || []).map(x => x._id)
    const expected = [rem?._id]
    await removeRem(p, rem)
    return {
      expected,
      actual,
    }
  },
  isPowerupEnum: async (plugin) => {
    const powerup = await plugin.powerup.getPowerupSlotByCode(BuiltInPowerupCodes.Todo, "Status");
    const e = (await powerup?.getChildrenRem())?.[0];
    const actual = await e?.isPowerupEnum();
    const expected = true;
    return {
      expected,
      actual,
    }
  },
  getPortalDirectlyIncludedRem: async (plugin, removeRem) => {
    const p = await plugin.rem.createPortal();
    const rem = await plugin.rem.createRem();
    await rem?.addToPortal(p?._id!);
    const actual = ((await p?.getPortalDirectlyIncludedRem()) || []).map(x => x._id)
    const expected = [rem?._id]
    await removeRem(p, rem)
    return {
      expected,
      actual,
    }
  },
  getType: async (plugin, removeRem) => {
    const rem = await plugin.rem.createPortal();
    const actual = await rem?.getType()
    const expected = RemType.PORTAL;
    await removeRem(rem);
    return {
      expected,
      actual,
    }
  },
  getPortalType: async (plugin, removeRem) => {
    const p = await plugin.rem.createPortal();
    const actual = await p?.getPortalType();
    const expected = true
    await removeRem(p);
    return {
      expected,
      actual: actual === undefined
    }
  },
  timesSelectedInSearch: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const expected = 0;
    const actual = await rem?.timesSelectedInSearch()
    await removeRem(rem)
    return {
      expected,
      actual,
    };
  },
  setIsCollapsedPortal: async (plugin, removeRem) => {
    const p = await plugin.rem.createPortal();
    await p?.setIsCollapsedPortal(true);
    const actual = await p?.isCollapsedPortal();
    await removeRem(p);
    return {
      expected: true,
      actual
    }
  },
  isCollapsedPortal: async (plugin, removeRem) => {
    const p = await plugin.rem.createPortal();
    await p?.setIsCollapsedPortal(true);
    const actual = await p?.isCollapsedPortal();
    await removeRem(p);
    return {
      expected: true,
      actual
    }
  },
  embeddedQueueViewMode: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    }
  },
  getSchemaVersion: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    }
  },
  getLastTimeMovedTo: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    }
  },
  addPowerup: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.addPowerup(BuiltInPowerupCodes.Document)
    const actual = await rem?.hasPowerup(BuiltInPowerupCodes.Document)
    await removeRem(rem);
    return {
      expected: true,
      actual,
    }
  },
  getLastPracticed: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    }
  },
  setHiddenExplicitlyIncludedState: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const expected = "included"
    await rem?.setHiddenExplicitlyIncludedState(expected);
    const actual = await rem?.getHiddenExplicitlyIncludedState();
    await removeRem(rem)
    return {
      expected,
      actual,
    }
  },
  getHiddenExplicitlyIncludedState: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const expected = "hidden"
    await rem?.setHiddenExplicitlyIncludedState(expected);
    const actual = await rem?.getHiddenExplicitlyIncludedState();
    await removeRem(rem)
    return {
      expected,
      actual,
    }
  },
  hasPowerup: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.addPowerup(BuiltInPowerupCodes.Document)
    const actual = await rem?.hasPowerup(BuiltInPowerupCodes.Document)
    await removeRem(rem);
    return {
      expected: true,
      actual,
    }
  },
  addSource: async (plugin, removeRem) => {
    const src = await plugin.rem.createRem();
    await src?.setText(["Source 1"]);
    const rem = await plugin.rem.createRem();
    await rem?.addSource(src?._id || "");
    const source = ((await rem?.getSources()) || [])[0]?.text;
    await removeRem(src, rem);
    return {
      expected: ["Source 1"],
      actual: source,
    };
  },
  addToPortal: async (plugin, removeRem) =>  {
    const portal = await plugin.rem.createPortal();
    const rem = await plugin.rem.createRem();
    await rem?.addToPortal(portal?._id || "");
    const actual = ((await portal?.allRemInDocumentOrPortal()) || []).map(x => x._id)
    await removeRem(portal, rem);
    return {
      expected: [rem?._id],
      actual,
    }
  },
  addTag: async (plugin, removeRem) => {
    const tag = await plugin.rem.createRem();
    await tag?.setText(["Tag 1"]);
    const rem = await plugin.rem.createRem();
    await rem?.addTag(tag?._id || "");
    const tags = (await rem?.getTagRems()) || [];
    await removeRem(tag, rem);
    return {
      expected: ["Tag 1"],
      actual: tags[0]?.text,
    };
  },
  getDescendants: async (plugin, removeRem) => {
    const parent = await plugin.rem.createRem();
    const child = await plugin.rem.createRem();
    await child?.setParent(parent?._id || "");
    const children = ((await parent?.getDescendants()) || []).map((x) => x._id);
    await removeRem(parent, child);
    return {
      expected: [child?._id],
      actual: children,
    };
  },
  getDescendantIds: async (plugin, removeRem) => {
    const parent = await plugin.rem.createRem();
    const child = await plugin.rem.createRem();
    await child?.setParent(parent?._id || "");
    const children = (await parent?.getDescendantIds()) || [];
    await removeRem(parent, child);
    return {
      expected: child?._id,
      actual: children[0],
    };
  },
  collapse: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  copyPortalReferenceToClipboard: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  copyTagReferenceToClipboard: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  deepRemsBeingReferenced: async (plugin, removeRem) => {
    const refDeep = await plugin.rem.createRem();
    await refDeep?.setText(["Deep"]);

    const refShallow = await plugin.rem.createRem();
    await refShallow?.setText([
      {
        i: "q",
        _id: refDeep?._id!,
      },
    ]);

    // rem -> shallow -> deep
    const rem = await plugin.rem.createRem();
    await rem?.setText([
      {
        i: "q",
        _id: refShallow?._id!,
      },
    ]);

    const actual = ((await rem?.deepRemsBeingReferenced()) || [])
      .map((x) => x._id)
      .sort();
    await removeRem(rem, refDeep, refShallow);
    return {
      expected: [refDeep?._id, refShallow?._id].sort(),
      actual,
    };
  },
  expand: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  getAliases: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Hi"]);
    const alias = await rem?.getOrCreateAliasWithText(["rem"]);
    const aliases = await rem?.getAliases();
    const actual = aliases?.map((x) => x._id);
    await removeRem(rem, alias);
    return {
      expected: [alias?._id],
      actual,
    };
  },
  getCards: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Hello"]);
    await rem?.setBackText(["World"]);
    await rem?.setPracticeDirection("forward");
    await sleep(500);
    const cards = (await rem?.getCards()) || [];
    await removeRem(rem);
    return {
      expected: 1,
      actual: cards.length,
    };
  },
  getChildrenRem: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const child1 = await plugin.rem.createRem();
    await child1?.setParent(rem?._id || "");
    const child2 = await plugin.rem.createRem();
    await child2?.setParent(rem?._id || "");
    const actual = ((await rem?.getChildrenRem()) || [])
      .map((x) => x._id)
      .sort();
    const expected = [child1?._id, child2?._id].sort();
    await removeRem(rem, child1, child2);
    return {
      expected,
      actual,
    };
  },
  getPracticeDirection: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPracticeDirection("both");
    const actual = await rem?.getPracticeDirection();
    await removeRem(rem);
    return {
      expected: "both",
      actual,
    };
  },
  getEnablePractice: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Hello"]);
    await rem?.setBackText(["World"]);
    const actual = await rem?.getEnablePractice();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  getFontSize: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPowerupProperty(BuiltInPowerupCodes.Header, "Size", ["H1"]);
    const actual = await rem?.getFontSize();
    await removeRem(rem);
    return {
      expected: "H1",
      actual,
    };
  },
  getHighlightColor: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPowerupProperty(BuiltInPowerupCodes.Highlight, "Color", [
      "Red",
    ]);
    const actual = await rem?.getHighlightColor();
    await removeRem(rem);
    return {
      expected: "Red",
      actual,
    };
  },
  isCardItem: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsCardItem(true);
    const actual = await rem?.isCardItem();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  isDocument: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsDocument(true);
    const actual = await rem?.isDocument();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  isListItem: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsListItem(true);
    const actual = await rem?.isListItem();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  isSlot: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsSlot(true);
    const actual = await rem?.isSlot();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  isTodo: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsTodo(true);
    const actual = await rem?.isTodo();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  getOrCreateAliasWithText: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const alias = await rem?.getOrCreateAliasWithText(["rem"]);
    const actual = ((await rem?.getAliases()) || []).map((x) => x._id);
    await removeRem(rem, alias);
    return {
      expected: [alias?._id],
      actual,
    };
  },
  getParentRem: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const parent = await plugin.rem.createRem();
    await rem?.setParent(parent?._id || "");
    const actual = await rem?.getParentRem();
    await removeRem(rem, parent);
    return {
      expected: parent?._id,
      actual: actual?._id,
    };
  },
  getPowerupProperty: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPowerupProperty(BuiltInPowerupCodes.Highlight, "Color", [
      "Red",
    ]);
    const actual = await rem?.getPowerupProperty(
      BuiltInPowerupCodes.Highlight,
      "Color"
    );
    await removeRem(rem);
    return {
      expected: "Red",
      actual,
    };
  },
  getSources: async (plugin, removeRem) => {
    const src = await plugin.rem.createRem();
    await src?.setText(["Source 1"]);
    const rem = await plugin.rem.createRem();
    await rem?.addSource(src?._id || "");
    const source = ((await rem?.getSources()) || [])[0]?.text;
    await removeRem(src, rem);
    return {
      expected: ["Source 1"],
      actual: source,
    };
  },
  getPowerupPropertyAsRichText: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPowerupProperty(BuiltInPowerupCodes.Highlight, "Color", [
      "Red",
    ]);
    const actual = await rem?.getPowerupPropertyAsRichText(
      BuiltInPowerupCodes.Highlight,
      "Color"
    );
    await removeRem(rem);
    return {
      expected: ["Red"],
      actual,
    };
  },
  getTagRems: async (plugin, removeRem) => {
    const tag = await plugin.rem.createRem();
    await tag?.setText(["Tag 1"]);
    const rem = await plugin.rem.createRem();
    await rem?.addTag(tag?._id || "");
    const tags = (await rem?.getTagRems()) || [];
    await removeRem(tag, rem);
    return {
      expected: ["Tag 1"],
      actual: tags[0].text,
    };
  },
  getTodoStatus: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsTodo(true);
    await rem?.setTodoStatus("Finished");
    const actual = await rem?.getTodoStatus();
    await removeRem(rem);
    return {
      expected: "Finished",
      actual,
    };
  },
  indent: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  merge: async (plugin, removeRem) => {
    const rem1 = await plugin.rem.createRem();
    const rem2 = await plugin.rem.createRem();
    await rem1?.merge(rem2?._id || "");
    const actual = (await plugin.rem.findOne(rem2?._id || ""))?._id === undefined
    await removeRem(rem1, rem2);
    return {
      actual,
      expected: true,
    };
  },
  mergeAndSetAlias: async (plugin) => {
    const rem1 = await plugin.rem.createRem();
    const rem2 = await plugin.rem.createRem();
    await rem2?.setText(["Alias"]);
    await rem1?.mergeAndSetAlias(rem2?._id || "");
    const alias = (await rem1?.getAliases())?.[0];
    return {
      expected: ["Alias"],
      actual: alias?.text,
    };
  },
  openRemAsPage: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  openRemInContext: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  outdent: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  portalsAndDocumentsIn: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const portal = await plugin.rem.createPortal();
    await rem?.addToPortal(portal?._id || "");
    const actual = ((await rem?.portalsAndDocumentsIn()) || []).map(
      (x) => x._id
    );
    await removeRem(rem, portal);
    return {
      expected: [portal?._id],
      actual,
    };
  },
  remove: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const child1 = await plugin.rem.createRem();
    await child1?.setParent(rem?._id || "");
    await child1?.remove();
    const actual = await rem?.getChildrenRem();
    await removeRem(rem, child1);
    return {
      expected: [],
      actual: actual,
    };
  },
  removeFromPortal: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const portal = await plugin.rem.createPortal();
    await rem?.addToPortal(portal?._id || "");
    await rem?.removeFromPortal(portal?._id || "");
    const actual = await rem?.portalsAndDocumentsIn();
    await removeRem(rem, portal);
    return {
      expected: [],
      actual,
    };
  },
  removeSource: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const src = await plugin.rem.createRem();
    await src?.setText(["Source 1"]);
    await rem?.addSource(src?._id || "");
    await rem?.removeSource(src?._id || "");
    const actual = await rem?.getSources();
    await removeRem(rem, src);
    return {
      expected: [],
      actual,
    };
  },
  remsBeingReferenced: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const refRem = await plugin.rem.createRem();
    await refRem?.setText(["Hello World"]);
    await rem?.setText([
      {
        i: "q",
        _id: refRem?._id!,
      },
    ]);
    const actual = ((await rem?.remsBeingReferenced()) || []).map((x) => x._id);
    await removeRem(rem, refRem);
    return {
      expected: [refRem?._id],
      actual,
    };
  },
  remsReferencingThis: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const refRem = await plugin.rem.createRem();
    await refRem?.setText(["Hello World"]);
    await rem?.setText([
      {
        i: "q",
        _id: refRem?._id!,
      },
    ]);
    const actual = ((await refRem?.remsReferencingThis()) || []).map(
      (x) => x._id
    );
    await removeRem(rem, refRem);
    return {
      expected: [rem?._id],
      actual,
    };
  },
  setBackText: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setBackText(["Back Text"]);
    const refetchedRem = await plugin.rem.findOne(rem?._id || "");
    const actual = refetchedRem?.backText;
    await removeRem(rem);
    return {
      expected: ["Back Text"],
      actual,
    };
  },
  setEnablePractice: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Hello"]);
    await rem?.setBackText(["World"]);
    const actual = await rem?.getEnablePractice();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  setFontSize: async (plugin) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPowerupProperty(BuiltInPowerupCodes.Header, "Size", ["H1"]);
    const actual = await rem?.getFontSize();
    return {
      expected: "H1",
      actual,
    };
  },
  setHighlightColor: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPowerupProperty(BuiltInPowerupCodes.Highlight, "Color", [
      "Red",
    ]);
    const actual = await rem?.getHighlightColor();
    await removeRem(rem);
    return {
      expected: "Red",
      actual,
    };
  },
  setIsCardItem: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsCardItem(true);
    const actual = await rem?.isCardItem();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  setIsDocument: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsDocument(true);
    const actual = await rem?.isDocument();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  setIsListItem: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsListItem(true);
    const actual = await rem?.isListItem();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  setIsSlot: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsSlot(true);
    const actual = await rem?.isSlot();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  setIsTodo: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsTodo(true);
    const actual = await rem?.isTodo();
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  setParent: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const parent = await plugin.rem.createRem();
    await rem?.setParent(parent?._id || "");
    const actual = await rem?.getParentRem();
    await removeRem(rem, parent);
    return {
      expected: parent?._id,
      actual: actual?._id,
    };
  },
  setPowerupProperty: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setPowerupProperty(BuiltInPowerupCodes.EditLater, "Message", [
      "Hello World",
    ]);
    const actual = await rem?.getPowerupProperty(
      BuiltInPowerupCodes.EditLater,
      "Message"
    );
    await removeRem(rem);
    return {
      expected: "Hello World",
      actual,
    };
  },
  setText: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["text"]);
    const refetchedRem = await plugin.rem.findOne(rem?._id || "");
    await removeRem(rem);
    return {
      expected: ["text"],
      actual: refetchedRem?.text,
    };
  },
  setTodoStatus: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setIsTodo(true);
    await rem?.setTodoStatus("Finished");
    const actual = await rem?.getTodoStatus();
    await removeRem(rem);
    return {
      expected: "Finished",
      actual,
    };
  },
  copyReferenceToClipboard: async () => {
    return {
      expected: "ignore",
      actual: "ignore",
    };
  },
  setType: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setType(SetRemType.CONCEPT);
    const refetchedRem = await plugin.rem.findOne(rem?._id || "");
    await removeRem(rem);
    return {
      expected: RemType.CONCEPT,
      actual: refetchedRem?.type,
    };
  },
  siblingRem: async (plugin, removeRem) => {
    const parent = await plugin.rem.createRem();
    const rem1 = await plugin.rem.createRem();
    const rem2 = await plugin.rem.createRem();
    await rem1?.setParent(parent?._id || "");
    await rem2?.setParent(parent?._id || "");
    const actual = ((await rem1?.siblingRem()) || []).map((x) => x._id);
    await removeRem(parent, rem1, rem2);
    return {
      expected: [rem2?._id],
      actual,
    };
  },
  tagAncestorRem: async (plugin, removeRem) => {
    const parent = await plugin.rem.createRem();
    const child1 = await plugin.rem.createRem();
    await child1?.setParent(parent?._id || "");
    await child1?.addTag(parent?._id || "");
    const actual = ((await child1?.tagAncestorRem()) || []).map((x) => x._id);
    await removeRem(parent, child1);
    return {
      expected: [parent?._id],
      actual,
    };
  },
  tagDescendantRem: async (plugin, removeRem) => {
    const grandparent = await plugin.rem.createRem();
    const parent = await plugin.rem.createRem();
    const child = await plugin.rem.createRem();
    await child?.setParent(parent?._id || "");
    await parent?.setParent(grandparent?._id || "");
    await child?.addTag(parent?._id || "");
    await parent?.addTag(grandparent?._id || "");
    const actual = ((await grandparent?.tagDescendantRem()) || []).map(
      (x) => x._id
    );
    await removeRem(grandparent, child, parent);
    return {
      expected: [parent?._id, child?._id],
      actual,
    };
  },
  taggedRem: async (plugin, removeRem) => {
    const parent = await plugin.rem.createRem();
    const child = await plugin.rem.createRem();
    await child?.addTag(parent?._id || "");
    const actual = ((await parent?.taggedRem()) || []).map((x) => x._id);
    await removeRem(parent, child);
    return {
      expected: [child?._id],
      actual,
    };
  },
  isPowerup: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const powerup = await plugin.powerup.getPowerupByCode(
      BuiltInPowerupCodes.Link
    );
    const actual = [await powerup?.isPowerup(), await rem?.isPowerup()];
    await removeRem(rem);
    return {
      expected: [true, false],
      actual,
    };
  },
};

renderWidget(() => <TestRunner tests={remObjectMethodTests} />);
