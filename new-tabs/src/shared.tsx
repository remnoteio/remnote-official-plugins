import type { RNPlugin } from "@remnote/plugin-sdk";

export const HOME_TAB_NAME = "Daily Doc";

export async function getOrCreateHomeWorkspace(plugin: RNPlugin) {
  const workspacePowerup = await plugin.powerup.getPowerupByCode("workspace");
  const workspaces = await workspacePowerup?.getChildrenRem();
  const home = workspaces?.find((tag) => tag.text[0] == HOME_TAB_NAME);
  if (home) {
    return home;
  } else {
    const newHome = await plugin.rem.createRem();
    await newHome?.addTag(workspacePowerup!._id!);
    await newHome?.setParent(workspacePowerup!._id, 0);
    await newHome?.setText([HOME_TAB_NAME]);
    return newHome;
  }
}
