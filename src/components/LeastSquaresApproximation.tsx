import React, { useState, useRef, useEffect } from 'react';
import { create, all, MathJsStatic } from 'mathjs';

const math: MathJsStatic = create(all);

const LeastSquaresApproximation: React.FC = () => {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [degree, setDegree] = useState<number>(1); // Default degree for polynomial
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handlePointChange = (index: number, x: number, y: number) => {
    const newPoints = [...points];
    newPoints[index] = [x, y];
    setPoints(newPoints);
  };

  const handleAddPoint = () => {
    setPoints([...points, [0, 0]]); // Add a new point with initial values [0, 0]
  };

  const calculateLeastSquares = () => {
    const n = points.length;
    if (n === 0) return [];

    const A = points.map(([x]) => Array.from({ length: degree + 1 }, (_, i) => Math.pow(x, i)));
    const AT = math.transpose(A);
    const ATA = math.multiply(AT, A);
    const ATy = math.multiply(AT, points.map(([, y]) => y));
    const coeffs = math.lusolve(ATA, ATy) as number[][];

    return coeffs.flat();
  };

  const drawApproximation = () => {
    const canvas = canvasRef.current;
    if (canvas && points.length > 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw points
        points.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x * 20 + canvas.width / 2, canvas.height / 2 - y * 20, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        });

        // Calculate coefficients for least squares approximation
        const coeffs = calculateLeastSquares();

        // Draw the approximation curve
        ctx.beginPath();
        const xMin = Math.min(...points.map(([x]) => x));
        const xMax = Math.max(...points.map(([x]) => x));
        const step = (xMax - xMin) / 100;

        for (let x = xMin; x <= xMax; x += step) {
          const y = coeffs.reduce((sum, coef, i) => sum + coef * Math.pow(x, i), 0);
          ctx.lineTo(x * 20 + canvas.width / 2, canvas.height / 2 - y * 20);
        }

        ctx.strokeStyle = 'blue';
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    drawApproximation();
  }, [points, degree]); // Redraw when points or degree change

  return (
    <div>
      <h2>Least Squares Approximation</h2>
      <button onClick={handleAddPoint}>Add Point</button>
      <label>
        Polynomial Degree:
        <input
          type="number"
          value={degree}
          onChange={(e) => setDegree(Number(e.target.value))}
          min="1"
        />
      </label>
      {points.map((point, index) => (
        <div key={index}>
          <label>{`Point ${index + 1}:`}</label>
          <input
            type="number"
            value={point[0]}
            onChange={(e) => handlePointChange(index, Number(e.target.value), point[1])}
            placeholder="x"
          />
          <input
            type="number"
            value={point[1]}
            onChange={(e) => handlePointChange(index, point[0], Number(e.target.value))}
            placeholder="y"
          />
        </div>
      ))}
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ border: '1px solid black', marginTop: '10px' }}
      />
    </div>
  );
};

export default LeastSquaresApproximation;