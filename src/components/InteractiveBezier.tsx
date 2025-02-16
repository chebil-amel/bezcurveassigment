import React, { useState, useEffect, useRef } from 'react';
import { create, all, MathJsStatic } from 'mathjs';

const math: MathJsStatic = create(all);

const InteractiveCurve: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [controlPoints, setControlPoints] = useState<[number, number][]>([
    [Math.random() * 10, Math.random() * 10],
    [Math.random() * 10, Math.random() * 10],
    [Math.random() * 10, Math.random() * 10],
    [Math.random() * 10, Math.random() * 10],
    [Math.random() * 10, Math.random() * 10],
  ]);
  const [degreeOfChange, setDegreeOfChange] = useState<number>(1.0);
  const [canvasWidth, setCanvasWidth] = useState<number>(800);
  const [canvasHeight, setCanvasHeight] = useState<number>(600);
  const [newPointX, setNewPointX] = useState<number>(0);
  const [newPointY, setNewPointY] = useState<number>(0);

  // Function to compute cubic spline interpolation
  const cubicSpline = (x: number[], y: number[], xInterp: number[]) => {
    const n = x.length;
    const a = [...y];
    const b = Array(n - 1).fill(0);
    const d = Array(n - 1).fill(0);
    const h = x.slice(1).map((xi, i) => xi - x[i]);

    const alpha = Array(n - 1)
      .fill(0)
      .map(
        (_, i) =>
          (3 / h[i]) * (a[i + 1] - a[i]) - (3 / h[i - 1]) * (a[i] - a[i - 1])
      );

    const l = Array(n).fill(1);
    const mu = Array(n).fill(0);
    const z = Array(n).fill(0);

    for (let i = 1; i < n - 1; i++) {
      l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1];
      mu[i] = h[i] / l[i];
      z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
    }

    const c = Array(n).fill(0);
    for (let j = n - 2; j >= 0; j--) {
      c[j] = z[j] - mu[j] * c[j + 1];
      b[j] = (a[j + 1] - a[j]) / h[j] - (h[j] * (c[j + 1] + 2 * c[j])) / 3;
      d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }

    const splineY = xInterp.map((xVal) => {
      let i = x.length - 2;
      while (i > 0 && xVal < x[i]) i--;
      const deltaX = xVal - x[i];
      return a[i] + b[i] * deltaX + c[i] * deltaX ** 2 + d[i] * deltaX ** 3;
    });

    return splineY;
  };

  // Function to compute least squares polynomial approximation
  const leastSquares = (x: number[], y: number[], degree: number) => {
    const A = x.map((xi) =>
      Array.from({ length: degree + 1 }, (_, i) => Math.pow(xi, i))
    );
    const AT = math.transpose(A);
    const ATA = math.multiply(AT, A);
    const ATy = math.multiply(AT, y);
    const coeffs = math.lusolve(ATA, ATy) as number[][];
    return coeffs.flat();
  };

  // Function to draw the curve on the canvas
  const drawCurve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = controlPoints.map(p => p[0] * 50);
    const y = controlPoints.map(p => p[1] * 50);

    const interpX = math.range(math.min(x), math.max(x), 1).toArray();
    const interpY = cubicSpline(x, y, interpX);

    const coeffs = leastSquares(x, y, 6);
    const approxY = interpX.map(xVal => 
      coeffs.reduce((sum, coef, i) => sum + coef * Math.pow(xVal, i), 0)
    );

    // Draw cubic spline interpolation curve
    ctx.beginPath();
    ctx.moveTo(interpX[0], canvas.height - interpY[0]);
    interpX.forEach((xVal, index) => {
      ctx.lineTo(xVal, canvas.height - interpY[index]);
    });
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // Draw least squares approximation curve
    ctx.beginPath();
    ctx.moveTo(interpX[0], canvas.height - approxY[0]);
    interpX.forEach((xVal, index) => {
      ctx.lineTo(xVal, canvas.height - approxY[index]);
    });
    ctx.strokeStyle = 'red';
    ctx.stroke();

    // Draw control points
    controlPoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x * 50, canvas.height - y * 50, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
    });
  };

  // Handle canvas click to randomly adjust control points
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const xClick = (event.clientX - rect.left) / 50;
    const yClick = (canvas.height - (event.clientY - rect.top)) / 50;

    const distances = controlPoints.map(([x, y]) =>
      Math.hypot(x - xClick, y - yClick)
    );
    const idx = distances.indexOf(Math.min(...distances));

    const newPoints = [...controlPoints];
    newPoints[idx] = [
      newPoints[idx][0] + (Math.random() - 0.5) * degreeOfChange,
      newPoints[idx][1] + (Math.random() - 0.5) * degreeOfChange,
    ];
    setControlPoints(newPoints);
  };

  // Handle adding new control point
  const handleAddPoint = () => {
    const newPoint = [newPointX, newPointY];
    setControlPoints([...controlPoints, newPoint]);
    setNewPointX(0);
    setNewPointY(0);
  };

  // Adjust canvas size and redraw curve on control points change
  useEffect(() => {
    const xValues = controlPoints.map(p => p[0]);
    const yValues = controlPoints.map(p => p[1]);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    setCanvasWidth((maxX - minX) * 50 + 100);
    setCanvasHeight((maxY - minY) * 50 + 100);
    drawCurve();
  }, [controlPoints]);

  return (
    <div>
      <h2>Curve Generator</h2>
      <label>Degree of Change: </label>
      <input
        type='number'
        value={degreeOfChange}
        onChange={(e) => setDegreeOfChange(Number(e.target.value))}
        step='0.1'
      />
      <div>
        <label>New Control Point X: </label>
        <input
          type='number'
          value={newPointX}
          onChange={(e) => setNewPointX(Number(e.target.value))}
        />
        <label>Y: </label>
        <input
          type='number'
          value={newPointY}
          onChange={(e) => setNewPointY(Number(e.target.value))}
        />
        <button onClick={handleAddPoint}>Add Control Point</button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: '1px solid black' }}
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default InteractiveCurve;