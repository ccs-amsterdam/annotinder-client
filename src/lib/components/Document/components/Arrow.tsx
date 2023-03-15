import { getArrow } from "perfect-arrows";
import styled from "styled-components";
import standardizeColor from "../../../functions/standardizeColor";
import { TokenSelection, Token } from "../../../types";

interface Props {
  id: string;
  tokens: Token[];
  tokenSelection: TokenSelection;
  tokenSelectionEnd?: TokenSelection;
  relation?: string;
  edgeColor?: string;
  fromColor?: string;
  toColor?: string;
  onClick?: () => void;
  usedPositions?: Record<number, Record<number, boolean>>;
}

const StyledG = styled.g<{ interactive: boolean }>`
  pointer-events: ${(p) => (p.interactive ? "stroke" : "none")};
  font-size: 0em;
  transition: all 0.3s;
  animation: fadeIn 1s;
  position: relative;
  z-index: 10;

  cursor: pointer;
  --strokewidth: 0.3rem;
  --radius: 0.4rem;
  --opacity: 0.7;
  --bigpolyOpacity: 0;
  --smallpolyOpacity: 1;


  &:hover {
    opacity: 1;
    font-size: 1.2rem;
    --strokewidth: 2rem;
    --opacity: 1;
    --radius: 1rem;
    --bigpolyOpacity: 1;
    --smallpolyOpacity: 0;
    
  }

  path {
    position: relative,
    z-index: var(--z);
  }

  path {
    pointer-events: none;
  }

  circle {
    r: var(--radius);
    stroke-width: 0.4rem;
    fill: var(--background-fixed);
    transition: r 0.1s;
    pointer-events: ${(p) => (p.interactive ? "all    " : "none")};
  }

  polygon {
    pointer-events: ${(p) => (p.interactive ? "all" : "none")};
  }
  .bigpolygon {
    opacity: var(--bigpolyOpacity);
    transition: opacity 0.1s;
  }
  .smallpolygon {
    opacity: var(--smallpolyOpacity);
  }

  .arrow {
    transition: stroke-width 0.1s, opacity 0.1s;
    opacity: var(--opacity);
    stroke-width: var(--strokewidth);
  }
  .arrow.background {
    opacity: var(--);
  }

  text,
  textPath {
    line-height: 1rem;
    fill: var(--text-fixed);
    font-weight: bold;
    overflow: show;
    paint-order: stroke;
    stroke-linejoin: round;
  }
`;

export default function Arrow({
  id,
  tokens,
  tokenSelection,
  tokenSelectionEnd,
  relation,
  edgeColor,
  fromColor,
  toColor,
  onClick,
  usedPositions,
}: Props) {
  if (tokenSelection.length !== 2) return;
  const elX = tokens[tokenSelection[0]]?.ref?.current;
  const elY = tokens[tokenSelection[1]]?.ref?.current;
  const elXend = tokenSelectionEnd ? tokens[tokenSelectionEnd[0]]?.ref?.current : elX;
  const elYend = tokenSelectionEnd ? tokens[tokenSelectionEnd[1]]?.ref?.current : elY;

  if (!elX || !elY) return null;
  if (elX === elY) return null;

  const X = elX.getBoundingClientRect();
  const Y = elY.getBoundingClientRect();
  const Xend = elXend.getBoundingClientRect();
  const Yend = elYend.getBoundingClientRect();

  const p1 = { x: X.x, y: X.y, h: X.height };
  const p2 = { x: Y.x, y: Y.y, h: Y.height };
  const p1end = { x: Xend.x + Xend.width, y: Xend.y };
  const p2end = { x: Yend.x + Yend.width, y: Yend.y };

  let [fromX, fromY] = ["left", "top"];
  let [toX, toY] = ["left", "top"];

  if (p1end.x - p2.x < -50) fromX = "right";
  if (p2end.x - p1.x < -50) toX = "right";
  if (p1.y - p2.y < 0) fromY = "bottom";
  if (p2.y - p1.y < 0) toY = "bottom";

  if (p2.x < p1.x && p1.y === p2.y) {
    fromY = "bottom";
    toY = "bottom";
  }

  function getXY(p, pend, x, y) {
    const xoffset = 9;
    const yoffset = 4;
    if (x === "left" && y === "top") return [p.x + xoffset, p.y - yoffset];
    if (x === "left" && y === "bottom") return [p.x + xoffset, p.y + p.h + yoffset];
    if (x === "right" && y === "top") return [pend.x - xoffset, pend.y - yoffset];
    if (x === "right" && y === "bottom") return [pend.x - xoffset, pend.y + p.h + yoffset];
  }
  let [p1x, p1y] = getXY(p1, p1end, fromX, fromY);
  let [p2x, p2y] = getXY(p2, p2end, toX, toY);
  let bow = p1y === p2y ? 0.1 : 0;

  if (usedPositions) {
    // if arrow positions already exist, curve the arrow a bit to avoid overlaps
    const relationString = `${p1x},${p1y},${p2x},${p2y}`;
    if (!usedPositions[relationString]) usedPositions[relationString] = 0;
    bow = bow + usedPositions[relationString] * 0.05;
    usedPositions[relationString] += 1;

    const fromPositionString = `${p1x},${p1y}`;
    if (!usedPositions[fromPositionString]) usedPositions[fromPositionString] = 0;
    const fromOffset = usedPositions[fromPositionString] * 10;
    p1x -= fromX === "right" ? fromOffset : -fromOffset;
    usedPositions[fromPositionString] += 1;

    const toPositionString = `${p2x},${p2y}`;
    if (!usedPositions[toPositionString]) usedPositions[toPositionString] = 0;
    const toOffset = usedPositions[toPositionString] * 10;
    p2x -= toX === "right" ? toOffset : -toOffset;
    usedPositions[toPositionString] += 1;
  }

  const arrow = getArrow(p1x, p1y, p2x, p2y, {
    bow: bow,
    stretch: 0,
    stretchMin: 0,
    stretchMax: 300,
    straights: false,
    //flip: flip,
  });
  // const arrow = getBoxToBoxArrow(p1.x, p1.y, p1.w, p1.h, p2.x, p2.y, p2.w, p2.h, {
  //   bow: 0.3,
  //   stretch: 0.5,
  //   stretchMin: 10,
  //   stretchMax: 50,
  //   padStart: 5,
  //   padEnd: 10,
  //   flip: false,
  //   straights: false,
  // });

  const [sx, sy, cx, cy, ex, ey, ae] = arrow;
  const endAngleAsDegrees = ae * (180 / Math.PI);

  const toColorNoAlpha = standardizeColor(toColor, "bb");
  const fromColorNoAlpha = standardizeColor(fromColor, "bb");
  const edgeColorNoAlpha = standardizeColor(edgeColor, "ee");

  return (
    <>
      <StyledG onClick={onClick} interactive={!!onClick}>
        <path
          id={id}
          className="arrow"
          d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}
          stroke={"var(--background-fixed)"}
          fill="none"
          strokeWidth="5"
        />
        <path
          id={id}
          className="arrow"
          d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}
          stroke={edgeColor || "var(--text)"}
          fill="none"
          strokeWidth="5"
        />

        <circle cx={sx} cy={sy} stroke={fromColorNoAlpha || edgeColorNoAlpha} />

        <polygon
          className="smallpolygon"
          points="0,-3 5,0, 0,3"
          fill={"var(--background-fixed)"}
          stroke={toColorNoAlpha || edgeColorNoAlpha}
          strokeWidth="3"
          transform={`translate(${ex},${ey}) rotate(${endAngleAsDegrees})`}
        />
        <polygon
          className="bigpolygon"
          points="2.3,-7 15,0, 2.3,7"
          fill={"var(--background-fixed)"}
          stroke={toColorNoAlpha || edgeColorNoAlpha}
          strokeWidth="4    "
          transform={`translate(${ex},${ey}) rotate(${endAngleAsDegrees})`}
        />

        <text dy={4}>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {relation || "new relation"}
          </textPath>
        </text>
      </StyledG>
    </>
  );
}
