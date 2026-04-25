import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'
import './chart.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function TempChart() {

  // mock data
  const dataMock = [
    { time: '10:00', temperature: 24 },
    { time: '10:05', temperature: 25 },
    { time: '10:10', temperature: 26 },
    { time: '10:15', temperature: 24.5 },
    { time: '10:20', temperature: 25.5 },
  ]

  const chartData = {
    labels: dataMock.map(item => item.time),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: dataMock.map(item => item.temperature),
        borderColor: '#ff8b3d',
        backgroundColor: 'rgba(255, 139, 61, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#ff8b3d',
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
        borderColor: 'rgba(255, 139, 61, 0.5)',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
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
          color: 'rgba(255, 139, 61, 0.1)',
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
          color: 'rgba(255, 139, 61, 0.1)',
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
        <h3 className="chart-title">Temperature Monitor</h3>
        <Line data={chartData} options={options} />
      </div>
    </div>
    </>
  )
}

export default TempChart
