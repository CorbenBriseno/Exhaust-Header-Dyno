import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function ChartPanel({ sweep, rpmTarget }: any) {
  const labels = sweep.map((s: any) => s.rpm);
  const torque = sweep.map((s: any) => s.torque);
  const hp = sweep.map((s: any) => s.hp);

  const data = {
    labels,
    datasets: [
      { label: 'Torque (lb-ft)', data: torque, borderColor: 'orange', yAxisID: 'y' },
      { label: 'Horsepower (hp)', data: hp, borderColor: 'cyan', yAxisID: 'y1' }
    ]
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index' },
    scales: {
      y: { type: 'linear', position: 'left' },
      y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
    },
    plugins: {
      annotation: {}
    }
  };

  return (
    <div>
      <h3>Dyno Curves</h3>
      <Line data={data} options={options} />
      <div className="small">Highlighted RPM: {rpmTarget}</div>
    </div>
  );
}
