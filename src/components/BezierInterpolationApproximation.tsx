import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const BezierInterpolationApproximation: React.FC = () => {
  const [controlPoints, setControlPoints] = useState<{ x: number, y: number }[]>([
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 4 },
  ]);
  const [newPoint, setNewPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Function to calculate the interpolated points using a cubic Bezier curve
  const interpolateBezier = (t: number) => {
    const n = controlPoints.length - 1;
    let x = 0;
    let y = 0;
    for (let i = 0; i <= n; i++) {
      const binomialCoeff = binomial(n, i);
      const powT = Math.pow(t, i);
      const pow1MinusT = Math.pow(1 - t, n - i);
      x += binomialCoeff * powT * pow1MinusT * controlPoints[i].x;
      y += binomialCoeff * powT * pow1MinusT * controlPoints[i].y;
    }
    return { x, y };
  };

  // Helper function to calculate binomial coefficients
  const binomial = (n: number, k: number) => {
    let coeff = 1;
    for (let i = n - k + 1; i <= n; i++) coeff *= i;
    for (let i = 1; i <= k; i++) coeff /= i;
    return coeff;
  };

  // Generate data points for the Bezier curve
  const bezierData = [];
  for (let t = 0; t <= 1; t += 0.01) {
    bezierData.push(interpolateBezier(t));
  }

  // Chart data
  const data = {
    labels: bezierData.map((_, index) => index),
    datasets: [
      {
        label: "Bezier Curve",
        data: bezierData.map(point => ({ x: point.x, y: point.y })),
        borderColor: "rgba(75,192,192,1)",
        fill: false,
        showLine: true,
        tension: 0.4,
      },
      {
        label: "Control Points",
        data: controlPoints.map(point => ({ x: point.x, y: point.y })),
        borderColor: "rgba(255,99,132,1)",
        fill: false,
        showLine: false,
        pointBackgroundColor: "rgba(255,99,132,1)",
        pointBorderColor: "rgba(255,99,132,1)",
        pointRadius: 5,
      },
    ],
  };

  // Chart options
  const options = {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPoint(prevState => ({
      ...prevState,
      [name]: Number(value),
    }));
  };

  // Handle adding new control point
  const handleAddPoint = () => {
    setControlPoints([...controlPoints, newPoint]);
    setNewPoint({ x: 0, y: 0 });
  };

  return (
    <div>
      <div>
        <h3>Add Control Point</h3>
        <label>
          X:
          <input type="number" name="x" value={newPoint.x} onChange={handleInputChange} />
        </label>
        <label>
          Y:
          <input type="number" name="y" value={newPoint.y} onChange={handleInputChange} />
        </label>
        <button onClick={handleAddPoint}>Add Point</button>
      </div>
            <Line data={data} options={options} />

    </div>
  );
};

export default BezierInterpolationApproximation;