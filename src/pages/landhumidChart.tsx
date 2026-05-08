import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler        // ← thêm dòng này

} 
from 'chart.js' 
import './chart.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

function LandhumidChart() {
  const API = 'http://localhost:3000/api'
  const [data, setData] = useState<{ time: string; humidity: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/landSensor`)
      if (!res.ok) throw new Error('Lỗi kết nối server')
      const json = await res.json()
      setData(json.history || [])
      setError(null)
    } catch (err) {
      setError('Không thể lấy dữ liệu cảm biến')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)  // refresh mỗi 5 giây
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: 'Humidity (%)',
        data: data.map(item => item.humidity),
        borderColor: '#0f8ca0',
        backgroundColor: 'rgba(15, 140, 160, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#0f8ca0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#112641',
          font: {
            size: 14,
            family: "'Space Grotesk', sans-serif",
            weight: '600'
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 38, 65, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(15, 140, 160, 0.5)',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#4f6278',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(15, 140, 160, 0.1)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#4f6278',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(15, 140, 160, 0.1)',
          drawBorder: false
        }
      }
    }
  } as any

  return (
    <>
    <div className='button_back'>
        <button className="btn btn-secondary" onClick={() => window.history.back() }
        style={{
            marginTop: '20px',
            padding: '10px 16px',
            fontSize: '14px',
            borderRadius: '4px',
            color: '#fff',
            backgroundColor: '#4f6278',
            border: 'none',
            cursor: 'pointer',
            }
        }
            >
        Back
        </button>
    </div>
    <div className="chart-container">
      <div className="chart-wrapper">
        <h3 className="chart-title">Humidity Monitor</h3>
        <Line data={chartData} options={options} />
      </div>
    </div>
    </>
  )
}

export default LandhumidChart;