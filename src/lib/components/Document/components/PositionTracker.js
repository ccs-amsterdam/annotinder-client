import { useState, useEffect, forwardRef } from "react";

// currently not used, but add to tokens if at some point want to imp

const PositionTracker = forwardRef(({ tokens, positionTracker }, ref) => {
  // monitors position, giving any information 'requested' by the positionTracker
  // positionTracker is a ref with an object, and any keys in this object will be tracked.
  // current options are 'visibleTokens' and 'containerRef'.
  const [scroll, setScroll] = useState();

  useEffect(() => {
    const refValue = ref?.current;
    if (!refValue) return;
    refValue.addEventListener("scroll", setScroll);
    return () => {
      refValue.removeEventListener("scroll", setScroll);
    };
  }, [ref, setScroll]);

  useEffect(() => {
    if (positionTracker?.current?.visibleTokens === undefined) return;
    const container = ref?.current?.getBoundingClientRect();
    if (!container) return;

    const timer = setTimeout(() => {
      // this one's costly, so use timeout to only update 'after' scrolling
      positionTracker.current.visibleTokens = [];
      for (let token of tokens) {
        const el = token?.ref?.current?.getBoundingClientRect();
        if (!el) continue;
        const visible =
          el.top <= container.top
            ? container.top - el.top <= el.height
            : el.bottom - container.bottom <= el.height;
        if (visible) positionTracker?.current?.visibleTokens.push(token);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [tokens, ref, positionTracker, scroll]);

  return <></>;
});

/**
 * Get an array of all tokens that are currenly visible (not outside of scroll) in BodyContainer
 *
 * @param {*} tokens           tokens array where each token has a .ref
 * @returns
 */
const getVisibleTokens = (tokens) => {
  const containerEl = document.getElementById("BodyContainer");
  if (!containerEl) return null;

  const container = containerEl.getBoundingClientRect();
  const visibleTokens = [];
  for (let token of tokens) {
    const el = token?.ref?.current?.getBoundingClientRect();
    if (!el) continue;
    const visible =
      el.top <= container.top
        ? container.top - el.top <= el.height
        : el.bottom - container.bottom <= el.height;
    if (visible) visibleTokens.push(token);
  }
  return visibleTokens;
};

export default PositionTracker;
