import {
  renderWidget,
  Rem,
  RNPlugin,
  BuiltInPowerupCodes,
} from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";

const powerupNamespaceMethodTests: TestResultMap<RNPlugin["powerup"]> = {
  getPowerupByCode: async (plugin) => {
    const powerup = await plugin.powerup.getPowerupByCode(
      BuiltInPowerupCodes.Link
    );
    const actual = powerup instanceof Rem && (await powerup.isPowerup());
    return {
      expected: true,
      actual,
    };
  },
  getPowerupSlotByCode: async (plugin) => {
    const powerupSlot = await plugin.powerup.getPowerupSlotByCode(
      BuiltInPowerupCodes.Link,
      "URL"
    );
    const actual = powerupSlot instanceof Rem
    return {
      expected: true,
      actual,
    };
  },
};

renderWidget(() => <TestRunner tests={powerupNamespaceMethodTests} />);
