import { renderWidget, RNPlugin } from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";

const storageNamespaceMethodTests: TestResultMap<RNPlugin["storage"]> = {
  setSession: async (plugin) => {
    await plugin.storage.setSession("setSession", "setSession");
    const actual = await plugin.storage.getSession("setSession");
    return {
      actual,
      expected: "setSession",
    };
  },
  getSession: async (plugin) => {
    await plugin.storage.setSession("getSession", "getSession");
    const actual = [
      await plugin.storage.getSession("getSession"),
      (await plugin.storage.getSession("asijdsnk")) || null,
    ];
    return {
      actual,
      expected: ["getSession", null],
    };
  },
  setLocal: async (plugin) => {
    await plugin.storage.setLocal("setLocal", "setLocal");
    const actual = await plugin.storage.getLocal("setLocal");
    return {
      actual,
      expected: "setLocal",
    };
  },
  getLocal: async (plugin) => {
    await plugin.storage.setLocal("getLocal", "getLocal");
    const actual = [
      await plugin.storage.getLocal("getLocal"),
      (await plugin.storage.getLocal("asijdsnk")) || null,
    ];
    return {
      actual,
      expected: ["getLocal", null],
    };
  },
  setSynced: async (plugin) => {
    await plugin.storage.setSynced("setSynced", "setSynced");
    const actual = await plugin.storage.getSynced("setSynced");
    return {
      actual,
      expected: "setSynced",
    };
  },
  getSynced: async (plugin) => {
    await plugin.storage.setSynced("getSynced", "getSynced");
    const actual = [
      await plugin.storage.getSynced("getSynced"),
      (await plugin.storage.getSynced("asijdsnk")) || null,
    ];
    return {
      actual,
      expected: ["getSynced", null],
    };
  },
};

renderWidget(() => <TestRunner tests={storageNamespaceMethodTests} />);
