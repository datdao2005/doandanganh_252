import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
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
      setError('Không thể lấy dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: 'Air Humidity (%)',
        data: data.map(item => item.humidity),
        borderColor: '#4299e1',
        backgroundColor: 'rgba(66, 153, 225, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#4299e1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: true } },
    scales: { y: { grid: { drawBorder: false } }, x: { grid: { drawBorder: false } } }
  } as any

  return (
    <>
    <div className='button_back'>
        <button className="btn btn-secondary" onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '10px 16px', color: '#fff', backgroundColor: '#4f6278', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
    </div>
    <div className="chart-container">
      <div className="chart-wrapper">
        <h3 className="chart-title">Air Humidity Monitor</h3>
        <Line data={chartData} options={options} />
      </div>
    </div>
    </>
  )
}
export default AirHumidChart