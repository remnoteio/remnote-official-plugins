import { renderWidget, RNPlugin } from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";
import {sleep} from "../lib/utils";

const cardNamespaceMethodTests: TestResultMap<RNPlugin["card"]> = {
  findOne: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Question"]);
    await rem?.setBackText(["Answer"]);
    await rem?.setPracticeDirection("forward")
    await sleep(500);
    const cards = (await rem?.getCards()) || [];
    const actual = (await plugin.card.findOne(cards[0]?._id))?._id;
    await removeRem(rem);
    return {
      expected: cards[0]._id,
      actual,
    };
  },
  findMany: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Question"]);
    await rem?.setBackText(["Answer"]);
    await rem?.setPracticeDirection("both");
    await sleep(500);
    const cards = ((await rem?.getCards()) || []).map((x) => x._id).sort();
    const actual = (await plugin.card.findMany(cards))
      .map((x) => x._id)
      .sort();
    await removeRem(rem);
    return {
      expected: cards,
      actual,
    };
  },
};

renderWidget(() => <TestRunner tests={cardNamespaceMethodTests} />);
