import { renderWidget, DateNamespace, Rem, BuiltInPowerupCodes } from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";

const dateMethodTests: TestResultMap<DateNamespace> = {
  getDailyDoc: async (plugin, removeRem) => {
    const doc = await plugin.date.getDailyDoc(new Date());
    const actual = doc instanceof Rem && (await doc.hasPowerup(BuiltInPowerupCodes.DailyDocument))
    await removeRem(doc)
    return {
      expected: true,
      actual,
    }
  },
  getTodaysDoc: async (plugin, removeRem) => {
    const doc = await plugin.date.getTodaysDoc();
    const actual = doc instanceof Rem && (await doc.hasPowerup(BuiltInPowerupCodes.DailyDocument))
    await removeRem(doc)
    return {
      expected: true,
      actual,
    }
  }
};

renderWidget(() => <TestRunner tests={dateMethodTests} />);
