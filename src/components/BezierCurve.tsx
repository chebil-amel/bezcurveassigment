import React, { useState, useRef } from "react";
import { line, curveBasis } from "d3-shape";

interface Point {
  x: number;
  y: number;
}

const BezierCurve: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([ 
    { x: 50, y: 200 },
    { x: 150, y: 50 },
    { x: 250, y: 300 },
    { x: 350, y: 150 }
  ]);

  const svgRef = useRef<SVGSVGElement>(null);

  const handleDrag = (index: number, event: React.MouseEvent) => {
    const newPoints = [...points];
    newPoints[index] = { x: event.clientX, y: event.clientY };
    setPoints(newPoints);
  };

  const bezierLine = line<Point>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(curveBasis);

  return (
    <svg ref={svgRef} width={400} height={400} style={{ border: "1px solid black" }}>
      {/* Bezier Curve */}
      <path d={bezierLine(points) || ""} fill="none" stroke="blue" strokeWidth={2} />
      
      {/* Control Points */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={6}
          fill="red"
          onMouseDown={(event) => handleDrag(index, event)}
          style={{ cursor: "pointer" }}
        />
      ))}
    </svg>
  );
};

export default BezierCurve;
