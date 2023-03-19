// custom scrollintoview

export const scrollToMiddle = (parent: HTMLElement, child: HTMLElement, position: number) => {
  // scroll parent to position of child
  // position should be value between 0 and 1 for relative position between top (0) and bottom (1)
  if (!parent || !child) return;
  const parentBounding = parent.getBoundingClientRect();
  const childBounding = child.getBoundingClientRect();

  const parentTop = parentBounding.top;
  const parentHeight = parentBounding.height;
  const childTop = childBounding.top;
  const topToCenter = parentHeight / (1 / position); // position 1/4 down from top

  parent.scrollTop = parent.scrollTop + childTop - (topToCenter + parentTop);
};

export const keepInView = (parent: HTMLElement, child: HTMLElement) => {
  // scroll parent to position of child
  // position should be value between 0 and 1 for relative position between top (0) and bottom (1)
  if (!parent || !child) return;
  const parentBounding = parent.getBoundingClientRect();
  const childBounding = child.getBoundingClientRect();

  const parentTop = parentBounding.top;
  const parentHeight = parentBounding.height;
  const childTop = childBounding.top;
  const childBottom = childBounding.bottom;
  const childHeight = childBounding.height;

  const needUp = childTop - parentTop < 50;
  const needDown = childBottom > parentTop + parentHeight * 0.9;

  //if (needUp > 0) parent.scrollTop = parent.scrollTop + needUp;
  if (needDown) {
    let scrollTo = parent.scrollTop + childTop - (parentHeight * 0.9 + parentTop);
    scrollTo += Math.max(childHeight, parentHeight * 0.9);
    parent.scrollTop = scrollTo;
  }
  if (needUp) {
    let scrollTo = parent.scrollTop + childTop - (parentHeight * 0.1 + parentTop);
    scrollTo -= Math.max(childHeight, parentHeight * 0.1);
    parent.scrollTop = scrollTo;
  }
};
