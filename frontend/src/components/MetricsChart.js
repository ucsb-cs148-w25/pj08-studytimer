import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./MetricsChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function MetricsChart({ tasks }) {
  // Prepare chart data
  const taskStats = {
    labels: ["In Progress", "Done"],
    datasets: [
      {
        data: [
          tasks.filter((task) => task.status === "In Progress").length,
          tasks.filter((task) => task.status === "Done").length
        ],
        backgroundColor: ["#87CEEB", "#CD5C5C"],
        hoverBackgroundColor: ["#ADD8E6", "#F08080"]
      }
    ]
  };

  // Display percentage of tasks in progress/done
  const chartOptions = {
    plugins: {
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
