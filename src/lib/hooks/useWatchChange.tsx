import { useRef } from "react";

/**
 * Watch for (shallow) changes in an array of dependencies.
 * Returns a boolean for whether stuff has changed. Lets you do thinks like:
 *
 * if (useWatchChange([foo, bar])) {
 *    setSomeState(0)
 * }
 *
 * @param deps an Array of things to watch, similar to the deps array in useEffects, useMemo, etc.
 * @param first should the value be true the first time?
 * @param debug just for convenience: print to console the indices of deps that changed
 * @returns
 */
function useWatchChange(deps: any[], first: boolean = true, debug: boolean = false): boolean {
  const prevDeps = useRef<any[]>();
  let value = first;
  if (prevDeps.current != null) value = hasChanged(prevDeps.current, deps, debug);
  prevDeps.current = deps;
  return value;
}

const hasChanged = (prev: any[], now: any[], debug: boolean) => {
  if (prev.length !== now.length) return true;
  const changed_deps: number[] = [];
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== now[i]) {
      if (debug) {
        changed_deps.push(i);
      } else {
        return true;
      }
    }
  }
  if (debug && changed_deps.length > 0) {
    console.log("changed dependencies: ", changed_deps);
    return true;
  }
  return false;
};

export default useWatchChange;
