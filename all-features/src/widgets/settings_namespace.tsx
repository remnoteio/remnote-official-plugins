import { renderWidget, RNPlugin } from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";

const settingsNamespaceMethodTests: TestResultMap<RNPlugin["settings"]> = {
  registerNumberSetting: async (plugin) => {
    const id = "number"
    await plugin.settings.registerNumberSetting({
      id,
      title: "asoidmasdmi",
      defaultValue: 15,
    })
    const actual = await plugin.settings.getSetting(id);
    return {
      expected: 15,
      actual,
    }
  },
  registerStringSetting: async (plugin) => {
    const id = "string"
    await plugin.settings.registerStringSetting({
      id,
      title: "asoidmasdmi",
      defaultValue: "15",
    })
    const actual = await plugin.settings.getSetting(id);
    return {
      expected: "15",
      actual,
    }
  },
  registerBooleanSetting: async (plugin) => {
    const id = "boolean"
    await plugin.settings.registerBooleanSetting({
      id,
      title: "asoidmasdmi",
      defaultValue: true,
    })
    const actual = await plugin.settings.getSetting(id);
    return {
      expected: true,
      actual,
    }
  },
  registerDropdownSetting: async (plugin) => {
    const id = "dropdown"
    await plugin.settings.registerDropdownSetting({
      id,
      title: "asoidmasdmi",
      defaultValue: "1",
      options: [
      {
        key: "1",
        label: "1",
        value: "1",
      }
      ]
    })
    const actual = await plugin.settings.getSetting(id);
    return {
      expected: "1",
      actual,
    }
  },
  getSetting: async (plugin) => {
    const id = "boolean"
    await plugin.settings.registerBooleanSetting({
      id,
      title: "asoidmasdmi",
      defaultValue: true,
    })
    const actual = await plugin.settings.getSetting(id);
    return {
      expected: true,
      actual,
    }
  }
};

renderWidget(() => <TestRunner tests={settingsNamespaceMethodTests} />);
