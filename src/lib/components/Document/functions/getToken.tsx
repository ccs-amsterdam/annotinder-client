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
    if (e.type === "contextmenu") {
      n = e.target as Element;
    }

    if (n.parentElement) {
      if (n.parentElement.className === "item") return [null, false];
    }

    if (n) {
      if (n.classList.contains("token")) return [n, false];
      if (n.parentElement) {
        if (n.parentElement.classList.contains("token")) return [n.parentElement, true];
      }
    }
    return [null, false];
  } catch (e) {
    return [null, false];
  }
};
