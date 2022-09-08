import { useState, useRef } from "react";
import { SetState } from "../types";

/**
 * A hook to get states that can update fast and easy without the hassle of useEffect.
 * Basically works like a regular useState, where initial is the inital value.
 * The onChange argument is a function that should return a new value (of the same type).
 * This function is called whenever anything in the deps (dependencies) array changes.
 *
 * So it's kinda like a useEffect latched on to a useState, but the function should return the
 * new value. Also, any variables can be used in the function regardless of the dependencies array
 *
 * @param initial
 * @param onChange
 * @param deps
 * @returns
 */
function useReactiveState<Type>(
  initial: Type,
  onChange: () => Type,
  deps: any[]
): [Type, SetState<Type>] {
  const [value, setValue] = useState<Type>(initial);
  const prevDeps = useRef<any[]>();

  const performUpdate = hasChanged(prevDeps.current, deps);
  prevDeps.current = deps;
  if (performUpdate) setValue(onChange());

  return [value, setValue];
}

const hasChanged = (prev: any[], now: any[]) => {
  if (!prev || !now) return false; // skips initial
  if (prev.length !== now.length) return true;
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== now[i]) {
      console.log(prev, now);
      return true;
    }
  }
  return false;
};

export default useReactiveState;
