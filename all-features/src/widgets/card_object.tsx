import { renderWidget, Card, QueueInteractionScore } from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";
import {sleep} from "../lib/utils";

const cardObjectMethodTests: TestResultMap<Card> = {
  getRem: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Question"]);
    await rem?.setBackText(["Answer"]);
    await rem?.setPracticeDirection("forward")
    await sleep(2000);
    const card = (await rem?.getCards())?.[0];
    const actual = (await card?.getRem())?._id;
    const expected = rem?._id
    await removeRem(rem);
    return  {
      expected,
      actual,
    }
  },
  getType: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Question"]);
    await rem?.setBackText(["Answer"]);
    await rem?.setPracticeDirection("forward")
    await sleep(2000);
    const card = (await rem?.getCards())?.[0];
    const actual = await card?.getType();
    await removeRem(rem);
    return  {
      expected: "forward",
      actual: actual
    }
  },
  remove: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Question"]);
    await rem?.setBackText(["Answer"]);
    await rem?.setPracticeDirection("forward")
    await sleep(2000);
    const card = (await rem?.getCards())?.[0];
    await card?.remove();
    const actual = (await plugin.card.findOne(card?._id || "")) || null;
    await removeRem(rem);
    return {
      expected: null,
      actual,
    };
  },
  updateCardRepetitionStatus: async (plugin, removeRem) => {
    const rem = await plugin.rem.createRem();
    await rem?.setText(["Question"]);
    await rem?.setBackText(["Answer"]);
    await rem?.setPracticeDirection("forward")
    await sleep(2000);
    const card = (await rem?.getCards())?.[0];
    const expected = QueueInteractionScore.HARD
    await card?.updateCardRepetitionStatus(expected);
    const updatedCard = await plugin.card.findOne(card?._id!);
    const actual = updatedCard?.repetitionHistory
      ? updatedCard?.repetitionHistory[updatedCard?.repetitionHistory?.length - 1].score
      : undefined;
    await removeRem(rem);
    return {
      expected,
      actual,
    };
  },
};

renderWidget(() => <TestRunner tests={cardObjectMethodTests} />);
