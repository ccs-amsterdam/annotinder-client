export default function getToken(tokens, e) {
  const [n, annotated] = getNode(e);
  if (n === null) return { index: null, annotated: false };
  return { index: getTokenAttributes(tokens, n), annotated };
}

const getNode = (e) => {
  try {
    // sometimes e is Restricted, and I have no clue why,
    // nor how to check this in a condition. hence the try clause
    let n;
    if (e.type === "mousemove" || e.type === "mouseup") {
      let path = e?.path || e.composedPath(); // path is not supported in Safari. composedPath should be standard, but just check for path first
      n = e.originalTarget || path[0];
    }
    if (e.type === "touchmove" || e.type === "touchstart") {
      // stupid hack since someone decided touchmove target is always the starting target (weirdly inconsistent with mousemove)
      // also, this still doesn't work for touchend, which is just arrrggg
      let position = e.touches[0];
      n = document.elementFromPoint(position.clientX, position.clientY);
    }
    if (n?.parentNode?.className === "item") {
      return [null, false];
    }

    if (n) {
      if (n.className.includes("token")) {
        return [n, false];
      }
      if (n.parentNode) {
        if (n.parentNode.className.includes("token")) return [n.parentNode, true];
      }
    }
    return [null, false];
  } catch (e) {
    return [null, false];
  }
};

const getTokenAttributes = (tokens, tokenNode) => {
  return parseInt(tokenNode.getAttribute("tokenindex"));
};
