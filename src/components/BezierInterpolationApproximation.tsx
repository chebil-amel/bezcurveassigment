import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const BezierInterpolationApproximation: React.FC = () => {
  const [controlPoints, setControlPoints] = useState<{ x: number, y: number }[]>([
    { x: 0, y: 0 },
    { x: 3, y: 6 },
    { x: 6, y: 9 },
    { x: 9, y: 12 },
  ]);
  const [newPoint, setNewPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [bezierData, setBezierData] = useState<{ x: number, y: number }[]>([]);
  const [approxData, setApproxData] = useState<{ x: number, y: number }[]>([]);

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

  // Function to calculate approximation points using linear interpolation between control points
  const approximateBezier = (t: number) => {
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
  useEffect(() => {
    const bezier = [];
    const approx = [];
    for (let t = 0; t <= 1; t += 0.01) {
      bezier.push(interpolateBezier(t));
      approx.push(approximateBezier(t));
    }
    setBezierData(bezier);
    setApproxData(approx);
  }, [controlPoints]);

  // Chart data
  const data = {
    labels: bezierData.map((_, index) => index),
    datasets: [
      {
        label: "Bezier Interpolation Curve",
        data: bezierData,
        borderColor: "rgba(75,192,192,1)",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Bezier Approximation Curve",
        data: approxData,
        borderColor: "rgba(192,75,192,1)",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Control Points",
        data: controlPoints,
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
        min: 0,
        max: 15, // Adjust max value to make the canvas bigger
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 15, // Adjust max value to make the canvas bigger
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
    if (newPoint.x >= 0 && newPoint.x <= 15 && newPoint.y >= 0 && newPoint.y <= 15) {
      setControlPoints([...controlPoints, newPoint]);
      setNewPoint({ x: 0, y: 0 });
    } else {
      alert("Control points must be within the canvas boundaries (0-15).");
    }
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