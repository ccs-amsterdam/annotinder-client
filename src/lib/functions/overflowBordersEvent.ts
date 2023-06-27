// adds a scroll event listener to an element that adds a top border if overflowing element is not at top,

// and adds a bottom border if the element is overflowing on scroll
export default function overflowBordersEvent(
  element: HTMLDivElement,
  topBorder: boolean = true,
  bottomBorder: boolean = true,
  borderStyle: string = "1px solid",
  borderColor: string = "grey"
) {
  if (!element) return;
  if (topBorder && element.scrollTop > 0) {
    element.style.borderTop = `${borderStyle} ${borderColor}`;
  } else {
    element.style.borderTop = `${borderStyle} transparent`;
  }
  if (bottomBorder && element.scrollTop + element.clientHeight < element.scrollHeight) {
    element.style.borderBottom = `${borderStyle} ${borderColor}`;
  } else {
    element.style.borderBottom = `${borderStyle} transparent`;
  }
}
