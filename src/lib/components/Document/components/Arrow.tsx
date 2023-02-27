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
}

const StyledG = styled.g<{ interactive: boolean }>`
  pointer-events: ${(p) => (p.interactive ? "stroke" : "none")};
  font-size: 0em;
  transition: all 0.3s;
  animation: fadeIn 1s;

  cursor: pointer;
  --strokewidth: 0.5rem;
  --radius: 0.5rem;
  --opacity: 0.4;
  --bigpolyOpacity: 0;
  --smallpolyOpacity: 1;

  circle {
    r: var(--radius);
    stroke-width: 0.4rem;
    fill: var(--background);
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

  &:hover {
    opacity: 1;
    font-size: 1.3rem;
    --strokewidth: 2rem;
    --opacity: 1;
    --radius: 1rem;
    --bigpolyOpacity: 1;
    --smallpolyOpacity: 0;
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
    line-height: 2rem;
    fill: var(--text);
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
    const xoffset = 2;
    const yoffset = 2;
    if (x === "left" && y === "top") return [p.x + xoffset, p.y - yoffset];
    if (x === "left" && y === "bottom") return [p.x + xoffset, p.y + p.h + yoffset];
    if (x === "right" && y === "top") return [pend.x - xoffset, pend.y - yoffset];
    if (x === "right" && y === "bottom") return [pend.x - xoffset, pend.y + p.h + yoffset];
  }
  const [p1x, p1y] = getXY(p1, p1end, fromX, fromY);
  const [p2x, p2y] = getXY(p2, p2end, toX, toY);
  const bow = p1y === p2y ? 0.15 : 0;

  const arrow = getArrow(p1x, p1y, p2x, p2y, {
    bow: bow,
    stretchMin: 50,
    stretchMax: 100,
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

  const toColorNoAlpha = standardizeColor(toColor || "grey", "bb");
  const fromColorNoAlpha = standardizeColor(fromColor || "grey", "bb");
  const edgeColorNoAlpha = standardizeColor(edgeColor || "grey", "ee");

  return (
    <>
      <StyledG onClick={onClick} interactive={!!onClick}>
        {/* <path
          id={id}
          className="arrow background"
          d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}
          stroke={"var(--background)"}
          fill="none"
          strokeWidth="5"
        /> */}
        <path
          id={id}
          className="arrow"
          d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}
          stroke={edgeColorNoAlpha || "grey"}
          fill="none"
          strokeWidth="5"
        />
        <circle cx={sx} cy={sy} stroke={fromColorNoAlpha} />

        <polygon
          className="smallpolygon"
          points="0,-8 8,0, 0,8"
          fill={"var(--background)"}
          stroke={toColorNoAlpha || "grey"}
          strokeWidth="3"
          transform={`translate(${ex},${ey}) rotate(${endAngleAsDegrees})`}
        />
        <polygon
          className="bigpolygon"
          points="2.3,-12 12,0, 2.3,12"
          fill={"var(--background)"}
          stroke={toColorNoAlpha || "grey"}
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
