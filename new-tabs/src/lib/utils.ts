import type {
  PaneRemWindowTree,
  RemIdWindowTree,
  RNPlugin,
} from "@remnote/plugin-sdk";
import { useEffect, useState } from "react";

export const paneRemTreeToRemTree = (
  pwt: PaneRemWindowTree
): RemIdWindowTree => {
  if ("remId" in pwt) {
    return pwt.remId;
  }
  return {
    ...pwt,
    first: paneRemTreeToRemTree(pwt.first),
    second: paneRemTreeToRemTree(pwt.second),
  };
};

export async function removeDeletedRem(plugin: RNPlugin, t: RemIdWindowTree) {
  const remIds = getAllRemIds(t);
  const existRem = ((await plugin.rem.findMany(remIds)) || [])
    .filter((x) => !!x)
    .map((x) => x._id);
  const idsToRemove = remIds.filter((id) => !existRem.includes(id));
  return idsToRemove.reduce(
    (acc, id) => (acc ? removeRemId(acc, id) : null),
    t
  );
}

function removeRemId(
  paneTree: RemIdWindowTree,
  idToRemove: string
): RemIdWindowTree | null {
  if (typeof paneTree === "string") {
    return paneTree === idToRemove ? null : paneTree;
  } else {
    if (paneTree.first == idToRemove) {
      return paneTree.second;
    } else if (paneTree.second == idToRemove) {
      return paneTree.first;
    } else {
      return {
        splitPercentage: paneTree.splitPercentage,
        direction: paneTree.direction,
        first: removeRemId(paneTree.first, idToRemove)!,
        second: removeRemId(paneTree.second, idToRemove)!,
      };
    }
  }
}

const getAllRemIds = (
  p: RemIdWindowTree,
  direction: "left" | "right" | "any" = "any"
): string[] => {
  if (typeof p === "string") {
    return [p];
  }
  if (direction === "any") {
    return getAllRemIds(p.first, direction).concat(
      getAllRemIds(p.second, direction)
    );
  } else if (direction === "left" || direction === "right") {
    if (p.direction === "column") {
      return getAllRemIds(p.first, direction).concat(
        getAllRemIds(p.second, direction)
      );
    } else {
      return direction === "left"
        ? getAllRemIds(p.first, direction)
        : getAllRemIds(p.second, direction);
    }
  } else if (direction === "up" || direction === "down") {
    if (p.direction === "row") {
      return getAllRemIds(p.first, direction).concat(
        getAllRemIds(p.second, direction)
      );
    } else {
      return direction === "up"
        ? getAllRemIds(p.first, direction)
        : getAllRemIds(p.second, direction);
    }
  }
  return [];
};

export function useDebounce<T>(value: T, msDelay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, msDelay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, msDelay]);
  return debouncedValue;
}
