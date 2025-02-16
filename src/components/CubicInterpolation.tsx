import React, { useRef, useState, useEffect } from 'react';
import { create, all, MathJsStatic } from 'mathjs';

const math: MathJsStatic = create(all);

const CubicInterpolation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [controlPoints, setControlPoints] = useState<[number, number][]>([
    [50, 250], [150, 50], [250, 450], [350, 250]
  ]);

  // Bernstein basis functions
  const bernstein = (t: number) => [
    Math.pow(1 - t, 3),                     // B_0^3(t)
    3 * t * Math.pow(1 - t, 2),              // B_1^3(t)
    3 * Math.pow(t, 2) * (1 - t),            // B_2^3(t)
    Math.pow(t, 3)                          // B_3^3(t)
  ];

  // Compute Bézier control points
  const computeBezierPoints = () => {
    const tValues = [0, 1/3, 2/3, 1];
    const M = tValues.map(t => bernstein(t));
    const M_inv = math.inv(M) as number[][];

    // Separate x and y coordinates
    const Px = controlPoints.map(p => p[0]);
    const Py = controlPoints.map(p => p[1]);

    // Calculate control points for Bézier curve
    const Bx = math.multiply(M_inv, Px) as number[];
    const By = math.multiply(M_inv, Py) as number[];

    return Bx.map((x, i) => [x, By[i]] as [number, number]);
  };

  // Draw Bézier curve and control polygon
  const drawCurve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bezierPoints = computeBezierPoints();

    // Draw Bézier Curve
    ctx.beginPath();
    ctx.moveTo(controlPoints[0][0], controlPoints[0][1]);
    ctx.bezierCurveTo(
      bezierPoints[1][0], bezierPoints[1][1], 
      bezierPoints[2][0], bezierPoints[2][1], 
      bezierPoints[3][0], bezierPoints[3][1]
    );
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Control Polygon
    ctx.beginPath();
    controlPoints.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'red';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Points
    controlPoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
    });
  };

  // Handle canvas click to update control points
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const xClick = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const yClick = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

    // Find nearest control point
    const distances = controlPoints.map(([x, y]) =>
      Math.hypot(x - xClick, y - yClick)
    );
    const idx = distances.indexOf(Math.min(...distances));

    // Update control point
    const newPoints = [...controlPoints];
    newPoints[idx] = [xClick, yClick];
    setControlPoints(newPoints);
  };

  // Redraw curve on control points change
  useEffect(() => {
    drawCurve();
  }, [controlPoints]);

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <h3>Using Bernstein basis functions to compute the position of points on the Bézier curve.</h3>
      <canvas
        ref={canvasRef}
        width={700}
        height={700}
        style={{ border: '1px solid black', maxWidth: '100%', height: 'auto' }}
        onClick={handleCanvasClick}
      />
      <h2>The interpolation in this code is achieved through cubic Bézier curves, utilizing Bernstein basis functions and matrix operations to compute the curve's control points. This allows for smooth, continuous curves that can be interactively manipulated by the user.</h2>
    <small>
  The `CubicInterpolation` component is a React functional component that visualizes cubic Bézier curves. It allows users to interactively manipulate control points on a canvas, and the curve is redrawn accordingly. The component uses Bernstein basis functions and matrix operations to compute the control points of the Bézier curve, ensuring smooth and continuous curves. The `mathjs` library is used for matrix operations. Users can click on the canvas to adjust the nearest control point, and the curve is updated in real-time. Boundary checks are implemented to ensure control points do not go outside the canvas.
</small>
    </div>
  );
};

export default CubicInterpolation;