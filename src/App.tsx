import React, { useState } from "react";
import BezierCurve from "./components/BezierCurve";
import InteractiveBezier from "./components/InteractiveBezier";
import CubicInterpolation from "./components/CubicInterpolation";
import BezierInterpolationApproximation from "./components/BezierInterpolationApproximation";

const App: React.FC = () => {
  const components = [
    {
      key: "BezierCurve",
      title: "cubic Bézier curve",
      description: "A cubic Bézier curve, a common tool in computer graphics for creating smooth and flexible shapes, can be interactively manipulated by users. They can adjust the curve's form in real-time by moving its control points.",
      component: <BezierCurve />,
    },
    {
      key: "CubicInterpolation",
      title: "Cubic Bézier Curve Generator",
      description: "This component demonstrates cubic Bézier interpolation, constructing curves that pass through four specified points using the method outlined in the chapter.",
      component: <CubicInterpolation />,
    },
    {
      key: "InteractiveBezier",
      title: "Cubic Spline Interpolation",
      description: "Interactive Bezier Curve Visualizer with Cubic Spline Interpolation and Least Squares Approximation",
      component: <InteractiveBezier />,
    },
    {
      key: "BezierInterpolationApproximation",
      title: "Bezier Curve Interpolation and Approximation",
      description: "This component demonstrates interpolation and approximation for a Bezier curve using control points and visualizes the curve",
      component: <BezierInterpolationApproximation />,
    },
  ];

  const [visibleComponents, setVisibleComponents] = useState({
    BezierCurve: true,
    CubicInterpolation: true,
    InteractiveBezier: true,
    BezierInterpolationApproximation: true,
  });

  const toggleVisibility = (key: string) => {
    setVisibleComponents(prevState => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  return (
    <div>
      <h1>Bézier Curve</h1>
      {components.map(({ key, title, description, component }) => (
        <div className="customDiv" key={key}>
          <h2 onClick={() => toggleVisibility(key)} style={{ cursor: "pointer" }}>
            {visibleComponents[key] ? "▾" : "▸"} {title}
          </h2>
          {visibleComponents[key] && (
            <>
              <h3>{description}</h3>
              {component}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default App;