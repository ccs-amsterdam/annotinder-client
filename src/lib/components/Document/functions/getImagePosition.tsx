export default function getImagePosition(e: any) {
  const [image, position] = getPosition(e);
  if (!image) return {};
  const borderOffset = 2; // offset for border around img

  return {
    image,
    x: e.clientX,
    y: e.clientY,
    imageX: position.x + borderOffset,
    imageY: position.y + borderOffset,
  };
}

const getPosition = (e: any) => {
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
    if (n.className === "AnnotatableImage") {
      return [n.getAttribute("data-imagefieldname"), n.getBoundingClientRect()];
    }
    return [null, null];
  } catch (e) {
    return [null, null];
  }
};
