import { Token } from "../../../types";

export default function getToken(tokens: Token[], e: TouchEvent | MouseEvent) {
  const [tokennode, annotated] = getNode(e);
  if (tokennode === null) return { index: null, annotated: false };

  const index = parseInt(tokennode.getAttribute("data-tokenindex"));
  return { index, annotated };
}

const getNode = (e: TouchEvent | MouseEvent): [Element, boolean] => {
  try {
    // sometimes e is Restricted, and I have no clue why,
    // nor how to check this in a condition. hence the try clause
    let n: Element;
    if (e.type === "mousemove" || e.type === "mouseup") {
      e = e as MouseEvent;

      // TODO: removed e.path and e.originalTarget because typescript didn't believe it, but double check whether rm this broke anything
      let path = e.composedPath();
      n = path[0] as Element;
    }
    if (e.type === "touchmove" || e.type === "touchstart") {
      // stupid hack since someone decided touchmove target is always the starting target (weirdly inconsistent with mousemove)
      // also, this still doesn't work for touchend, which is just arrrggg
      e = e as TouchEvent;
      // type guard because touches doesn't exist on MouseEvent (and typescript does not pick up on the e.type )
      let position = e.touches[0];
      n = document.elementFromPoint(position.clientX, position.clientY);
    }

    if (n.parentNode) {
      const pn = n.parentNode as Element;
      if (pn.className === "item") return [null, false];
    }

    if (n) {
      if (n.className.includes("token")) {
        return [n, false];
      }
      // TODO: According to typescript this is impossible, so check whether it's still needed or just legacy junk
      // if ("parentNode" in n) {
      //   if (n.parentNode.classList.includes("token")) return [n.parentNode, true];
      // }
    }
    return [null, false];
  } catch (e) {
    return [null, false];
  }
};
