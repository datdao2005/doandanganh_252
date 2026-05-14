import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import './chart.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

function LightChart() {
  const API = 'http://localhost:3000/api'
  const [data, setData] = useState<{ time: string; light: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/lightSensor`)
      if (!res.ok) throw new Error('Lỗi kết nối server')
      const json = await res.json()
      setData(json.history || [])
      setError(null)
    } catch (err) {
      setError('Không thể lấy dữ liệu ánh sáng')
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
        label: 'Ánh sáng (Lux)',
        data: data.map(item => item.light),
        borderColor: '#e3a21a',
        backgroundColor: 'rgba(227, 162, 26, 0.12)',
        pointBackgroundColor: '#e3a21a',
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
      y: { grid: { color: 'rgba(148, 163, 184, 0.2)' }, ticks: { color: '#64748b' } }
    }
  }

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <button className="back-button" onClick={() => window.history.back()}>← Quay lại</button>
        <h3 className="chart-title">☀️ Biểu đồ cường độ ánh sáng</h3>
        {loading ? <div className="loading-state">Đang tải...</div> : error ? <div className="error-state">{error}</div> : <Line data={chartData} options={options as any} />}
      </div>
    </div>
  )
}

export default LightChart
