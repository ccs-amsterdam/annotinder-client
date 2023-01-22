import { getBoxToBoxArrow } from "perfect-arrows";
import { Edge, Token } from "../../../types";

interface Props {
  tokens: Token[];
  edge: Edge;
  relation?: string;
  edgeColor?: string;
  fromColor?: string;
  toColor?: string;
}

export default function Arrow({ tokens, edge, relation, edgeColor, fromColor, toColor }: Props) {
  if (edge.length === 0) return;
  const elX = tokens[edge[0]].ref.current;
  const elY = tokens[edge[1]].ref.current;
  if (!elX || !elY) return null;

  const X = elX.getBoundingClientRect();
  const Y = elY.getBoundingClientRect();

  console.log(X);
  const p1 = { x: X.x, y: X.y - X.height * 2, w: X.width, h: X.height };
  const p2 = { x: Y.x, y: Y.y - Y.height * 2, w: Y.width, h: Y.height };

  const arrow = getBoxToBoxArrow(p1.x, p1.y, p1.w, p1.h, p2.x, p2.y, p2.w, p2.h, {
    bow: 0.2,
    stretch: 0.5,
    stretchMin: 40,
    stretchMax: 420,
    padStart: 5,
    padEnd: 10,
    flip: false,
    straights: true,
  });

  const [sx, sy, cx, cy, ex, ey, ae, as, ec] = arrow;

  const endAngleAsDegrees = ae * (180 / Math.PI);

  return (
    <>
      <circle cx={sx} cy={sy} r={4} fill={fromColor || "#0009"} />
      <path d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`} stroke={edgeColor || "#0009"} fill="none" />
      <polygon
        points="0,-6 12,0, 0,6"
        fill={toColor || "#0009"}
        transform={`translate(${ex},${ey}) rotate(${endAngleAsDegrees})`}
      />
    </>
  );
}
