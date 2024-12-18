import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // For Chart.js v3+

const SpeedometerChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Speed (km/h)",
        data: [],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  });

  const [speed, setSpeed] = useState(50); // Initial speed
  const [isRunning, setIsRunning] = useState(false); // Toggle for Start Button
  const socketRef = useRef(null); // WebSocket Reference

  // Establish WebSocket connection
  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8765");

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data received from WebSocket:", data);

      // Update chart with received data
      const { speed: receivedSpeed, timestamp } = data;
      setChartData((prevData) => ({
        labels: [...prevData.labels.slice(-19), timestamp],
        datasets: [
          {
            ...prevData.datasets[0],
            data: [...prevData.datasets[0].data.slice(-19), receivedSpeed],
          },
        ],
      }));

      setSpeed(receivedSpeed);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  // Start data generation and send it via WebSocket
  const startDataGeneration = () => {
    if (isRunning) return;
    setIsRunning(true);

    const interval = setInterval(() => {
      const newSpeed = Math.floor(Math.random() * 100) + 20; // Random speed (20-120)
      const currentTime = new Date().toLocaleTimeString();

      // Send data via WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const message = { speed: newSpeed, timestamp: currentTime };
        socketRef.current.send(JSON.stringify(message));
      }
    }, 1000); // Interval of 1 second

    // Stop generation on component unmount
    return () => clearInterval(interval);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Speedometer (Time Series)",
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Time" },
      },
      y: {
        title: { display: true, text: "Speed (km/h)" },
        min: 0,
        max: 150,
      },
    },
  };

  return (
    <div style={{ width: "700px", margin: "50px auto" }}>
      <h2>Current Speed: {speed} km/h</h2>
      <button
        onClick={startDataGeneration}
        disabled={isRunning}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          backgroundColor: isRunning ? "gray" : "green",
          color: "white",
          border: "none",
          cursor: isRunning ? "not-allowed" : "pointer",
        }}
      >
        {isRunning ? "Running..." : "Start Data Generation"}
      </button>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default SpeedometerChart;
