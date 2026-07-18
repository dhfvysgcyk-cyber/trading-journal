import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler,
} from 'chart.js'
import type { EquityPoint } from '../../types/domain'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export function EquityChart({ points }: { points: EquityPoint[] }) {
  const data = {
    labels: points.map((p) => p.event_date),
    datasets: [
      {
        label: 'Kontostand',
        data: points.map((p) => p.balance),
        borderColor: '#3fa4ff',
        backgroundColor: 'rgba(63, 164, 255, 0.14)',
        fill: true,
        tension: 0.25,
        pointRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#9298a6', maxTicksLimit: 6 }, grid: { display: false } },
      y: { ticks: { color: '#9298a6' }, grid: { color: '#262a35' } },
    },
  }

  return (
    <div className="chart-box">
      <Line data={data} options={options} />
    </div>
  )
}
