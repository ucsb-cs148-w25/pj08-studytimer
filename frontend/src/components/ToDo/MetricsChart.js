import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./MetricsChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function MetricsChart({ tasks }) {
  // Prepare chart data
  const taskStats = {
    labels: ["In Progress", "Completed"],
    datasets: [
      {
        data: [
          tasks.filter((task) => task.status === "In Progress").length,
          tasks.filter((task) => task.status === "Done").length
        ],
        backgroundColor: [
          getComputedStyle(document.documentElement).getPropertyValue('--in-progress-color').trim(),
          getComputedStyle(document.documentElement).getPropertyValue('--completed-color').trim()
        ],
        hoverBackgroundColor: [
          getComputedStyle(document.documentElement).getPropertyValue('--in-progress-hover').trim(),
          getComputedStyle(document.documentElement).getPropertyValue('--completed-hover').trim()
        ]
      }
    ]
  };

  // Display percentage of tasks in progress/done
  const chartOptions = {
    cutout: "0%",
    plugins: {
      legend: {
        position: "bottom",  // Move legend below the chart
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
        }
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataset = tooltipItem.dataset.data;
            const total = dataset.reduce((sum, value) => sum + value, 0);
            const value = dataset[tooltipItem.dataIndex];
            const percentage = ((value / total) * 100).toFixed(0);
            return `${tooltipItem.label}: ${percentage}% (${value} tasks)`;
          }
        }
      }
    }
  };

  return (
    <div className="chartContainer">
      <Doughnut data={taskStats} options={chartOptions} />
    </div>
  );
}

export default MetricsChart;
