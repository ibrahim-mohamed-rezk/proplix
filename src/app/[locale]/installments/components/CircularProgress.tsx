"use client";

import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface CircularProgressProps {
  value: number;
  strokeWidth?: number;
}

const CircularProgress = ({
  value,
  strokeWidth = 20,
}: CircularProgressProps) => {
  return (
    <div className="statstics-circle-container" style={{ width: 253, height: 253 }}>
      <CircularProgressbar
        value={value}
        strokeWidth={strokeWidth}
        styles={buildStyles({
          textColor: "#FF6625",
          pathColor: "#FF6625",
          trailColor: "#D8D8D8",
          strokeLinecap: "butt",
        })}
      />
    </div>
  );
};

export default CircularProgress;
