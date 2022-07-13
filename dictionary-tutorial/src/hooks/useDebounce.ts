import * as R from "react";

export function useDebounce<T>(value: T, msDelay: number) {
  const [debouncedValue, setDebouncedValue] = R.useState(value);
  R.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, msDelay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, msDelay]);
  return debouncedValue;
}
