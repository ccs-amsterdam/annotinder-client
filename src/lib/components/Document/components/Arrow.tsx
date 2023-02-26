import { getArrow } from "perfect-arrows";
import styled from "styled-components";
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
}

const StyledG = styled.g`
  pointer-events: stroke;
  font-size: 0em;
  transition: all 0.3s;
  cursor: pointer;
  --strokewidth: 0.4rem;
  --opacity: 0.2;

  circle {
    stroke-width: 0.4rem;
    fill: var(--background);
  }

  &:hover {
    opacity: 1;
    font-size: 1.3rem;
    --strokewidth: 2rem;
    --opacity: 0.8;
  }

  .arrow {
    opacity: var(--opacity);
    stroke-width: var(--strokewidth);
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

  let flip = false;

  if (p1.x < p2.x) {
    p1.x = p1end.x - 7;
    p2.x = p2.x - 7;
  }
  if (p2end.x < p1.x) {
    p2.x = p2end.x;
    //flip = true;
  }
  if (p1.y < p2end.y) {
    p1.y = p1.y + p1.h + 5;
  }
  if (p2.y < p1end.y) {
    p2.y = p2.y + p2.h + 5;
  }

  const arrow = getArrow(p1.x, p1.y, p2.x, p2.y, {
    bow: 0.1,
    stretch: 0.3,
    stretchMin: 10,
    stretchMax: 50,
    padStart: 0,
    padEnd: 0,
    flip: flip,
    straights: false,
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

  return (
    <>
      <StyledG onClick={() => console.log("click relation")}>
        <path
          id={id}
          className="arrow"
          d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}
          stroke={edgeColor || "var(--text)"}
          fill="none"
          strokeWidth="5"
        />
        <path
          d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}
          stroke={"transparent"}
          fill="none"
          strokeWidth="10"
        />
        <circle cx={sx} cy={sy} r={4} stroke={fromColor} fill="transparent" />

        <polygon
          points="0,-8 8,0, 0,8"
          onMouseMove={() => console.log("enter")}
          fill={toColor || "var(--text)"}
          transform={`translate(${ex},${ey}) rotate(${endAngleAsDegrees})`}
        />
        <text>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {relation + " 🠪"}
          </textPath>
        </text>
      </StyledG>
    </>
  );
}
