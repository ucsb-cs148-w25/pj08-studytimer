import React from "react";

const BreakTimer = ({ breakTimeLeft, totalBreakTime, formattedTime }) => {
    const radius = 50;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const progress = ((totalBreakTime - breakTimeLeft) / totalBreakTime) * circumference;

    return (
        <div className="break-timer-container">
            <svg width="250" height="250" viewBox="0 0 120 120">
                {/* Background Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#4caf50"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                {/* Timer Text Inside Circle */}
                <text x="60" y="65" textAnchor="middle" dy=".3em" className="break-timer">
                    {formattedTime}
                </text>
            </svg>
        </div>
    );
};

export default BreakTimer;