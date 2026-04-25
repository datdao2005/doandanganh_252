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
} 
from 'chart.js' 
import './chart.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function LandhumidChart() {

  // mock data
  const dataMock = [
    { time: '10:00', humidity: 60 },
    { time: '10:05', humidity: 62 },
    { time: '10:10', humidity: 58 },
    { time: '10:15', humidity: 65 },
    { time: '10:20', humidity: 63 },
    { time: '10:25', humidity: 61 },
    { time: '10:30', humidity: 64 },
    { time: '10:35', humidity: 59 },
  ]

  const chartData = {
    labels: dataMock.map(item => item.time),
    datasets: [
      {
        label: 'Humidity (%)',
        data: dataMock.map(item => item.humidity),
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