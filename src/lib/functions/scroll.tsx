// custom scrollintoview

export const scrollToMiddle = (parent: HTMLElement, child: HTMLElement, position: number) => {
  // scroll parent to position of child
  // position should be value between 0 and 1 for relative position between top (0) and bottom (1)
  if (!parent || !child) return;
  const parentBounding = parent.getBoundingClientRect();
  const clientBounding = child.getBoundingClientRect();

  const parentTop = parentBounding.top;
  const parentHeight = parentBounding.height;
  const clientTop = clientBounding.top;
  const topToCenter = parentHeight / (1 / position); // position 1/4 down from top

  parent.scrollTop = parent.scrollTop + clientTop - (topToCenter + parentTop);
};

export const keepInView = (parent: HTMLElement, child: HTMLElement) => {
  // scroll parent to position of child
  // position should be value between 0 and 1 for relative position between top (0) and bottom (1)
  if (!parent || !child) return;
  const parentBounding = parent.getBoundingClientRect();
  const clientBounding = child.getBoundingClientRect();

  const parentTop = parentBounding.top;
  const parentHeight = parentBounding.height;
  const clientTop = clientBounding.top;
  const clientHeight = clientBounding.height;

  const needUp = clientTop - parentTop < 50;
  const needDown = clientTop > parentTop + parentHeight * 0.9;

  //if (needUp > 0) parent.scrollTop = parent.scrollTop + needUp;
  if (needDown) {
    let scrollTo = parent.scrollTop + clientTop - (parentHeight * 0.9 + parentTop);
    scrollTo += Math.max(clientHeight, parentHeight * 0.9);
    console.log(scrollTo);
    parent.scrollTop = scrollTo;
  }
  if (needUp) {
    parent.scrollTop = parent.scrollTop + clientTop - (parentHeight * 0.1 + parentTop);
  }
};
