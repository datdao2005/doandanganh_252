import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentTime } from '../utils/time'

const HUMIDITY_THRESHOLD = 30  // cảnh báo khi độ ẩm dưới 30%

function IndexPage() {
  const API = '/api'
  const navigate = useNavigate()

  const [humidity, setHumidity] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ---- fetch độ ẩm đất ----
  const fetchLandSensor = async () => {
    try {
      const res = await fetch(`${API}/landSensor`)
      if (!res.ok) throw new Error('Lỗi kết nối server')
      const json = await res.json()

      if (json.latest) {
        setHumidity(json.latest.humidity)
        setLastUpdated(json.latest.time)
      }
      setError(null)
    } catch (err) {
      setError('Không thể lấy dữ liệu cảm biến')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLandSensor()
    const interval = setInterval(fetchLandSensor, 5000)  // refresh mỗi 5 giây
    return () => clearInterval(interval)
  }, [])

  // ---- helpers ----
  const isLow = humidity !== null && humidity < HUMIDITY_THRESHOLD

  const handleLogout = () => {
    window.location.href = '/login'
  }

  return (
    <div style={{ padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🌱 Smart Farm Dashboard</h1>
        <button onClick={handleLogout} style={btnStyle('#4f6278')}>Logout</button>
      </div>

      {/* Soil Humidity Card */}
      <div style={cardStyle(isLow ? '#fff3cd' : '#f0f9fa')}>
        <h3>💧 Độ ẩm đất</h3>

        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}

        {!loading && !error && (
          <>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: isLow ? '#d9534f' : '#0f8ca0' }}>
              {humidity !== null ? `${humidity}%` : '—'}
            </p>

            {/* Cảnh báo */}
            {isLow && (
              <div style={alertStyle}>
                ⚠️ Độ ẩm đất quá thấp! Cần tưới nước ngay.
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: '#888' }}>
              Cập nhật lúc: {lastUpdated || '—'}
            </p>
          </>
        )}

        {/* Link sang chart */}
        <button
          onClick={() => navigate('/landhumidChart')}
          style={btnStyle('#0f8ca0')}
        >
          📊 Xem biểu đồ lịch sử
        </button>
      </div>

    </div>
  )
}

// ---- Inline styles helpers ----
const cardStyle = (bg: string): React.CSSProperties => ({
  backgroundColor: bg,
  border: '1px solid #ddd',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
  maxWidth: '400px',
  transition: 'background-color 0.3s'
})

const btnStyle = (bg: string): React.CSSProperties => ({
  marginTop: '16px',
  padding: '10px 18px',
  fontSize: '14px',
  borderRadius: '6px',
  color: '#fff',
  backgroundColor: bg,
  border: 'none',
  cursor: 'pointer',
})

const alertStyle: React.CSSProperties = {
  backgroundColor: '#f8d7da',
  color: '#842029',
  padding: '10px 14px',
  borderRadius: '6px',
  marginBottom: '12px',
  fontWeight: '500'
}

export default IndexPage