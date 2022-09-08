import { useRef } from "react";

/**
 * Watch for (shallow) changes in an array of dependencies.
 * Returns a boolean for whether stuff has changed
 *
 * @param deps an Array of things to watch, similar to the deps array in useEffects, useMemo, etc.
 * @param first should the value be true the first time?
 * @returns
 */
function useWatchChange(deps: any[], first: boolean = true): boolean {
  const prevDeps = useRef<any[]>();
  let value = first;
  if (prevDeps.current) value = hasChanged(prevDeps.current, deps);
  prevDeps.current = deps;
  return value;
}

const hasChanged = (prev: any[], now: any[]) => {
  if (prev.length !== now.length) return true;
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== now[i]) {
      return true;
    }
  }
  return false;
};

export default useWatchChange;
