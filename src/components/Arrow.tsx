import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { redrawArrow, state$ } from "../store/store";

const marginTop = 50;
const radius = 30;
const arrowSize = 16;
const strokeWidth = 2;
const arrowColor = "#ccc";

export const Arrow: FC<{ from: string; to: string }> = ({ from, to }) => {
  const [sourcePosition, setSourcePosition] = useState({ x: 0, y: 0 });
  const [destinationPosition, setDestinationPosition] = useState({
    x: 0,
    y: 0,
  });

  const [inited, setInited] = useState(false);

  const draw = () => {
    const scale = state$.ui.scale.peek();

    const frame = document.getElementById("arrrow-frame");
    if (!frame) return;

    const sourceElement = document.getElementById(from);
    const destinationElement = document.getElementById(to);

    if (!sourceElement || !destinationElement) return;

    const sourceRect = sourceElement.getBoundingClientRect();
    const destinationRect = destinationElement.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    setSourcePosition({
      x: (sourceRect.left + sourceRect.width / 2 - frameRect.left) / scale,
      y: (sourceRect.bottom - frameRect.top) / scale,
    });
    setDestinationPosition({
      x:
        (destinationRect.left + destinationRect.width / 2 - frameRect.left) /
        scale,
      y: (destinationRect.top - frameRect.top) / scale,
    });

    setInited(true);
  };

  useEffect(() => {
    draw();
    const cancel = redrawArrow.on(() => {
      setTimeout(() => draw(), 0);
    });

    return () => cancel();
  }, [from, to]);

  if (!inited) return null;

  const width = Math.max(
    destinationPosition.x - sourcePosition.x,
    arrowSize + strokeWidth
  );
  const height = destinationPosition.y - sourcePosition.y;

  const withCurbs = width > radius * 2;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: sourcePosition.y,
        left: sourcePosition.x,
        width,
        height,
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker
            id="triangle"
            viewBox={`0 0 ${arrowSize} 10`}
            refX="10"
            refY={arrowSize / 2}
            markerUnits="strokeWidth"
            markerWidth="10"
            markerHeight={arrowSize}
            orient="auto"
          >
            <path
              d="M 0 0 L 10 8 L 0 16"
              strokeWidth={strokeWidth}
              stroke={arrowColor}
              fill="none"
              strokeLinecap="round"
            />
          </marker>
        </defs>

        <path
          //d={`m0,0 c 0,${height}  ${width},0 ${width}, ${height}`}
          d={
            withCurbs
              ? `m${
                  arrowSize / 2
                },0 v${marginTop}, a${radius},${radius} 0 0 0 ${radius},${radius} h${
                  width - radius * 2 - arrowSize - strokeWidth
                } a${radius},${radius} 0 0 1 ${radius},${radius} v${
                  height - marginTop - radius * 2
                }`
              : `m${arrowSize / 2},0 v${height}`
          }
          fill="none"
          stroke={arrowColor}
          strokeWidth={strokeWidth}
          markerEnd="url(#triangle)"
        />
      </svg>
    </div>,
    document.getElementById("arrrow-frame")!
  );
};
