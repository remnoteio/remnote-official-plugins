import { renderWidget, Rem, RNPlugin, RemType } from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";

const remNamespaceMethodTests: TestResultMap<RNPlugin["rem"]> = {
  getAll: async (plugin, removeRem) => {
    const rem1 = await plugin.rem.createRem();
    const rem2 = await plugin.rem.createRem();
    const rem3 = await plugin.rem.createRem();
    const allRem = (await plugin.rem.getAll()).map(x => x._id);
    const actual = [rem1, rem2, rem3]
      .map(x => x!._id)
      .every(id => allRem.includes(id));
    await removeRem(rem1, rem2, rem3);
    return {
      actual,
      expected: true,
    }
  },
  moveRems: async (plugin, removeRem) => {
    const rem1 = await plugin.rem.createRem();
    const rem2 = await plugin.rem.createRem();
    const rem3 = await plugin.rem.createRem();
    const expected = [
      rem1,
      rem2,
      rem3,
    ]?.map(x => x?._id);
    const parent = await plugin.rem.createRem();
    await plugin.rem.moveRems(expected as string[], parent?._id!, 0);
    const actual = (await parent?.getChildrenRem())?.map(x => x._id);
    await removeRem(rem1, rem2, rem3, parent);
    return {
      expected,
      actual
    }
  },
  createPortal: async (plugin, removeRem) => {
    const portal = await plugin.rem.createPortal();
    const actual = await portal?.getType()
    const expected = RemType.PORTAL;
    await removeRem(portal)
    return {
      actual,
      expected
    }
  },
  findOne: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const actual = rem && (await plugin.rem.findOne(rem._id))?._id;
    await removeRem(rem);
    return {
      expected: rem?._id,
      actual,
    };
  },
  findMany: async (plugin, removeRem) => {
    const rem1 = await plugin.rem.createRem();
    const rem2 = await plugin.rem.createRem();
    const actual =
      rem1 &&
      rem2 &&
      (await plugin.rem.findMany([rem1._id, rem2._id]))
        ?.map((x) => x._id)
        ?.sort();
    await removeRem(rem1, rem2);
    return {
      expected: [rem1?._id, rem2?._id].sort(),
      actual,
    };
  },
  createRem: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    const actual = rem instanceof Rem;
    await removeRem(rem);
    return {
      expected: true,
      actual,
    };
  },
  createWithMarkdown: async (plugin, removeRem) => {
    const rem = await plugin.rem.createWithMarkdown(
      `
- parent
  - child1
  - child2
`.trim()
    );
    const children = (await rem?.getChildrenRem()) || [];
    const actual = rem
      ? [...rem.text, ...children[0].text, ...children[1].text]
      : [];
    await removeRem(rem, ...children);
    return {
      expected: ["parent", "child1", "child2"],
      actual,
    };
  },
  findByName: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["test"]);
    const actual = (await plugin.rem.findByName(["test"], null))?._id;
    await removeRem(rem);
    return {
      expected: rem?._id,
      actual,
    };
  },
};

renderWidget(() => <TestRunner tests={remNamespaceMethodTests} />);
