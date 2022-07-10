import { PaneRemWindowTree, PaneRem, RemIdWindowTree } from "@remnote/plugin-sdk";

export const replaceRemId = (pwt: PaneRemWindowTree, paneId: string, remId: string) => {
  if ('remId' in pwt) {
    return paneId === pwt.paneId
      ? { paneId, remId } 
      : pwt
  }
  else {
    return {
      ...pwt,
      first: replaceRemId(pwt.first, paneId, remId),
      second: replaceRemId(pwt.second, paneId, remId),
    }
  }
}

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

/**
 * Recursively get all descendant panes in a top-left to bottom-right order.
 */
export const getAllPaneRemIds = (
  p: PaneRemWindowTree,
  direction: "left" | "right" | "any" = "any"
): PaneRem[] => {
  if ('remId' in p) {
    return [p];
  }
  if (direction === "any") {
    return getAllPaneRemIds(p.first, direction).concat(
      getAllPaneRemIds(p.second, direction)
    );
  } else if (direction === "left" || direction === "right") {
    if (p.direction === "column") {
      return getAllPaneRemIds(p.first, direction).concat(
        getAllPaneRemIds(p.second, direction)
      );
    } else {
      return direction === "left"
        ? getAllPaneRemIds(p.first, direction)
        : getAllPaneRemIds(p.second, direction);
    }
  } else if (direction === "up" || direction === "down") {
    if (p.direction === "row") {
      return getAllPaneRemIds(p.first, direction).concat(
        getAllPaneRemIds(p.second, direction)
      );
    } else {
      return direction === "up"
        ? getAllPaneRemIds(p.first, direction)
        : getAllPaneRemIds(p.second, direction);
    }
  }
  return [];
};
