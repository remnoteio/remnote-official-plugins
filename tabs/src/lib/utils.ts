import {PaneRemWindowTree, RemIdWindowTree} from "@remnote/plugin-sdk";

export const paneRemTreeToRemTree = (pwt: PaneRemWindowTree): RemIdWindowTree => {
  if ('remId' in pwt) {
    return pwt.remId;
  }
  else {
    return {
      ...pwt,
      first: paneRemTreeToRemTree(pwt.first),
      second: paneRemTreeToRemTree(pwt.second),
    }
  }
}
