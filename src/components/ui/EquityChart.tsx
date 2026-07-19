import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler,
} from 'chart.js'
import type { EquityPoint } from '../../types/domain'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export function EquityChart({ points, compact = false }: { points: EquityPoint[]; compact?: boolean }) {
  const data = {
    labels: points.map((p) => p.event_date),
    datasets: [
      {
        label: 'Kontostand',
        data: points.map((p) => p.balance),
        borderColor: '#e5e5e5',
        backgroundColor: 'rgba(229, 229, 229, 0.10)',
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: compact ? 1.5 : 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#999999', maxTicksLimit: compact ? 3 : 6, font: { size: compact ? 9 : 11 } }, grid: { display: false } },
      y: { ticks: { color: '#999999', maxTicksLimit: compact ? 4 : 6, font: { size: compact ? 9 : 11 } }, grid: { color: '#2e2e2e' } },
    },
  }

  return (
    <div className={compact ? 'chart-box chart-box-sm' : 'chart-box'}>
      <Line data={data} options={options} />
    </div>
  )
}
