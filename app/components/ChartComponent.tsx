// ChartComponent.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const ChartComponent = ({ data }: { data: { name: string; value: number }[] }) => {
  // Prepare data for the pie chart
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Stress Level Distribution',
        data: data.map(item => item.value),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.raw + '%';
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h2 className="text-center text-xl font-semibold mb-4">Stress Level Distribution</h2>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default ChartComponent;