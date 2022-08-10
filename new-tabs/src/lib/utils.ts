import {PaneRemWindowTree, RemIdWindowTree} from "@remnote/plugin-sdk";
import {useEffect, useState} from "react";

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
