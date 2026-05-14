import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import './chart.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

function AirHumidChart() {
  const API = 'http://localhost:3000/api'
  const [data, setData] = useState<{ time: string; humidity: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/airHumidSensor`)
      if (!res.ok) throw new Error('Lỗi kết nối server')
      const json = await res.json()
      setData(json.history || [])
      setError(null)
    } catch (err) {
      setError('Không thể lấy dữ liệu độ ẩm không khí')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: 'Độ ẩm không khí (%)',
        data: data.map(item => item.humidity),
        borderColor: '#49a5f1',
        backgroundColor: 'rgba(73, 165, 241, 0.12)',
        pointBackgroundColor: '#49a5f1',
        borderWidth: 3,
        fill: true,
        tension: 0.45,
        cubicInterpolationMode: 'monotone' as const,
        pointRadius: 4,
        pointHoverRadius: 7
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { labels: { color: '#42526b', font: { family: 'Inter', weight: '700' as const } } },
      tooltip: { backgroundColor: 'rgba(20, 30, 48, 0.92)', padding: 12 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { min: 0, max: 100, grid: { color: 'rgba(148, 163, 184, 0.2)' }, ticks: { color: '#64748b' } }
    }
  }

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <button className="back-button" onClick={() => window.history.back()}>← Quay lại</button>
        <h3 className="chart-title">🫧 Biểu đồ độ ẩm không khí</h3>
        {loading ? <div className="loading-state">Đang tải...</div> : error ? <div className="error-state">{error}</div> : <Line data={chartData} options={options as any} />}
      </div>
    </div>
  )
}

export default AirHumidChart
