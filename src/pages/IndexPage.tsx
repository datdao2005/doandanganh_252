import { CSSProperties, useEffect, useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import './chart.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const API = 'http://localhost:3000/api'
const SOIL_WARNING_THRESHOLD = 30

type SensorKey = 'temperature' | 'soilHumidity' | 'airHumidity' | 'light'

type SensorConfig = {
  key: SensorKey
  title: string
  icon: string
  unit: string
  color: string
  max: number
}

type SensorLatest = {
  time?: string
  temperature?: number
  humidity?: number
  light?: number
  gdd?: number
}

type SensorResponse = {
  latest: SensorLatest | null
  history?: SensorLatest[]
}

type SensorState = {
  value: number | null
  time: string
  history: SensorLatest[]
}

type PumpState = {
  pump1: boolean
  pump2: boolean
  pump1Auto?: boolean
  pump2Auto?: boolean
  autoMode?: boolean
}

const sensorConfigs: SensorConfig[] = [
  { key: 'temperature', title: 'Nhiệt độ', icon: '🌡️', unit: '°C', color: '#ea6f20', max: 60 },
  { key: 'soilHumidity', title: 'Độ ẩm đất', icon: '💧', unit: '%', color: '#2f8f5b', max: 100 },
  { key: 'airHumidity', title: 'Độ ẩm không khí', icon: '🫧', unit: '%', color: '#49a5f1', max: 100 },
  { key: 'light', title: 'Cường độ Ánh sáng', icon: '☀️', unit: 'lux', color: '#e3a21a', max: 4096 }
]

const emptySensor: SensorState = { value: null, time: '—', history: [] }

function normalizeNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function displayValue(value: number | null) {
  if (value === null || Number.isNaN(value)) return '--'
  return Number.isInteger(value) ? `${value}` : `${Number(value).toFixed(1)}`
}

function getGaugePercent(value: number | null, max: number) {
  if (value === null || Number.isNaN(value)) return '0%'
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return `${percent}%`
}

function getLatestTime(...responses: SensorResponse[]) {
  return responses.find(res => res.latest?.time)?.latest?.time || '—'
}

function IndexPage() {
  const [sensors, setSensors] = useState<Record<SensorKey, SensorState>>({
    temperature: emptySensor,
    soilHumidity: emptySensor,
    airHumidity: emptySensor,
    light: emptySensor
  })
  const [gdd, setGdd] = useState<SensorState>(emptySensor)
  const [pumpState, setPumpState] = useState<PumpState>({
    pump1: false,
    pump2: false,
    pump1Auto: true,
    pump2Auto: true,
    autoMode: true
  })
  const [visibleSeries, setVisibleSeries] = useState<Record<SensorKey, boolean>>({
    temperature: true,
    soilHumidity: true,
    airHumidity: true,
    light: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const autoMode = Boolean(pumpState.pump1Auto && pumpState.pump2Auto)

  const fetchJson = async <T,>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API}/${endpoint}`)
    if (!res.ok) throw new Error(`Cannot fetch /api/${endpoint}`)
    return await res.json()
  }

  const fetchDashboard = async () => {
    try {
      const [temp, air, soil, lux, gddData, pump] = await Promise.all([
        fetchJson<SensorResponse>('tempSensor'),
        fetchJson<SensorResponse>('airHumidSensor'),
        fetchJson<SensorResponse>('landSensor'),
        fetchJson<SensorResponse>('lightSensor'),
        fetchJson<SensorResponse>('gddSensor').catch(() => ({ latest: null, history: [] })),
        fetchJson<PumpState>('pumper').catch(() => ({ pump1: false, pump2: false, pump1Auto: true, pump2Auto: true, autoMode: true }))
      ])

      setSensors({
        temperature: {
          value: normalizeNumber(temp.latest?.temperature),
          time: temp.latest?.time || '—',
          history: temp.history || []
        },
        airHumidity: {
          value: normalizeNumber(air.latest?.humidity),
          time: air.latest?.time || '—',
          history: air.history || []
        },
        soilHumidity: {
          value: normalizeNumber(soil.latest?.humidity),
          time: soil.latest?.time || '—',
          history: soil.history || []
        },
        light: {
          value: normalizeNumber(lux.latest?.light),
          time: lux.latest?.time || '—',
          history: lux.history || []
        }
      })

      setGdd({
        value: normalizeNumber(gddData.latest?.gdd),
        time: gddData.latest?.time || getLatestTime(temp, air, soil, lux),
        history: gddData.history || []
      })

      setPumpState({
        pump1: Boolean(pump.pump1),
        pump2: Boolean(pump.pump2),
        pump1Auto: pump.pump1Auto ?? Boolean(pump.autoMode),
        pump2Auto: pump.pump2Auto ?? Boolean(pump.autoMode),
        autoMode: pump.autoMode
      })

      setError(null)
    } catch (err) {
      console.error(err)
      setError('Không thể lấy dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    const interval = window.setInterval(fetchDashboard, 5000)
    return () => window.clearInterval(interval)
  }, [])

  const toggleSeries = (key: SensorKey) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const setAutoMode = async (state: boolean) => {
    await fetch(`${API}/pumper/auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    })

    setPumpState(prev => ({
      ...prev,
      pump1Auto: state,
      pump2Auto: state,
      autoMode: state
    }))
    await fetchDashboard()
  }

  const setPump = async (pump: 1 | 2, state: boolean) => {
    await fetch(`${API}/pumper/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pump, state })
    })

    setPumpState(prev => ({
      ...prev,
      pump1: pump === 1 ? state : prev.pump1,
      pump2: pump === 2 ? state : prev.pump2,
      pump1Auto: pump === 1 ? false : prev.pump1Auto,
      pump2Auto: pump === 2 ? false : prev.pump2Auto
    }))
    await fetchDashboard()
  }

  const chartData = useMemo(() => {
    const tempHistory = sensors.temperature.history
    const soilHistory = sensors.soilHumidity.history
    const airHistory = sensors.airHumidity.history
    const lightHistory = sensors.light.history
    const maxLength = Math.max(tempHistory.length, soilHistory.length, airHistory.length, lightHistory.length)

    const labels = Array.from({ length: maxLength }).map((_, index) =>
      tempHistory[index]?.time ||
      airHistory[index]?.time ||
      soilHistory[index]?.time ||
      lightHistory[index]?.time ||
      ''
    )

    const datasets = [
      visibleSeries.temperature && {
        label: 'Nhiệt độ (°C)',
        data: Array.from({ length: maxLength }).map((_, index) => tempHistory[index]?.temperature ?? null),
        borderColor: '#ea6f20',
        backgroundColor: 'rgba(234, 111, 32, 0.10)',
        pointBackgroundColor: '#ea6f20',
        yAxisID: 'y',
        fill: false,
        tension: 0.5,
        borderWidth: 3,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        cubicInterpolationMode: 'monotone' as const
      },
      visibleSeries.soilHumidity && {
        label: 'Độ ẩm đất (%)',
        data: Array.from({ length: maxLength }).map((_, index) => soilHistory[index]?.humidity ?? null),
        borderColor: '#2f8f5b',
        backgroundColor: 'rgba(47, 143, 91, 0.10)',
        pointBackgroundColor: '#2f8f5b',
        yAxisID: 'y',
        fill: false,
        tension: 0.5,
        borderWidth: 3,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        cubicInterpolationMode: 'monotone' as const
      },
      visibleSeries.airHumidity && {
        label: 'Độ ẩm KK (%)',
        data: Array.from({ length: maxLength }).map((_, index) => airHistory[index]?.humidity ?? null),
        borderColor: '#49a5f1',
        backgroundColor: 'rgba(73, 165, 241, 0.10)',
        pointBackgroundColor: '#49a5f1',
        yAxisID: 'y',
        fill: false,
        tension: 0.5,
        borderWidth: 3,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        cubicInterpolationMode: 'monotone' as const
      },
      visibleSeries.light && {
        label: 'Ánh sáng (Lux)',
        data: Array.from({ length: maxLength }).map((_, index) => lightHistory[index]?.light ?? null),
        borderColor: '#e3a21a',
        backgroundColor: 'rgba(227, 162, 26, 0.10)',
        pointBackgroundColor: '#e3a21a',
        yAxisID: 'yLight',
        fill: false,
        tension: 0.5,
        borderWidth: 3,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        cubicInterpolationMode: 'monotone' as const
      }
    ].filter(Boolean)

    return { labels, datasets }
  }, [sensors, visibleSeries])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: false,
          color: '#42526b',
          font: { family: 'Inter', size: 13, weight: '700' as const },
          padding: 18
        }
      },
      tooltip: {
        backgroundColor: 'rgba(20, 30, 48, 0.92)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        borderColor: 'rgba(255,255,255,0.16)',
        borderWidth: 1,
        titleFont: { family: 'Inter', size: 13, weight: '800' as const },
        bodyFont: { family: 'Inter', size: 13, weight: '700' as const }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', maxRotation: 0, font: { family: 'Inter', size: 12 } }
      },
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Nhiệt độ (°C) / Độ ẩm (%)',
          color: '#64748b',
          font: { family: 'Inter', weight: '800' as const }
        },
        grid: { color: 'rgba(148, 163, 184, 0.20)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } }
      },
      yLight: {
        position: 'right' as const,
        min: 0,
        title: {
          display: true,
          text: 'Ánh sáng (Lux)',
          color: '#64748b',
          font: { family: 'Inter', weight: '800' as const }
        },
        grid: { drawOnChartArea: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } }
      }
    }
  }

  const handleLogout = () => {
    window.location.href = '/login'
  }

  return (
    <div className="smartfarm-page">
      <main className="smartfarm-shell">
        <header className="dashboard-header">
          <div>
            <h1 className="header-title">🌱 Smart Farm Dashboard</h1>
            <p className="header-subtitle">Hệ thống giám sát và tưới tiêu tự động thông minh</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>Đăng xuất</button>
        </header>

        {error && <div className="error-state">⚠️ {error}</div>}

        <section className="sensor-grid">
          {sensorConfigs.map(sensor => {
            const state = sensors[sensor.key]
            const hidden = !visibleSeries[sensor.key]
            const isLowSoil = sensor.key === 'soilHumidity' && state.value !== null && state.value < SOIL_WARNING_THRESHOLD

            return (
              <article
                key={sensor.key}
                className={`sensor-card ${hidden ? 'is-hidden' : ''}`}
                style={{ '--sensor-color': sensor.color } as CSSProperties}
                onClick={() => toggleSeries(sensor.key)}
                title="Nhấn để bật/tắt đường biểu đồ"
              >
                <div className="sensor-card-header">
                  <div className="sensor-title-wrap">
                    <span className="sensor-icon">{sensor.icon}</span>
                    <h2 className="sensor-title">{sensor.title}</h2>
                  </div>
                  <span className="status-pill">{hidden ? 'Đang ẩn' : 'Trực tuyến'}</span>
                </div>

                <div className="gauge-area">
                  <div
                    className="gauge"
                    style={{ '--gauge-value': getGaugePercent(state.value, sensor.max), '--gauge-color': sensor.color } as CSSProperties}
                  >
                    <div className="gauge-value">
                      {loading ? '--' : displayValue(state.value)}
                      <span className="gauge-unit">{sensor.unit}</span>
                    </div>
                  </div>
                </div>

                {isLowSoil && <div className="sensor-alert">⚠️ Đất quá khô, cần tưới!</div>}
                <p className="sensor-updated">Cập nhật lần cuối: {state.time || '—'}</p>
              </article>
            )
          })}
        </section>

        <section className="gdd-card">
          <div>
            <h3>🌿 GDD / Phân tích dữ liệu</h3>
            <p>Giá trị tích lũy dựa trên ngưỡng ánh sáng LUX.</p>
          </div>
          <div className="gdd-value">
            {displayValue(gdd.value)}
            <span className="gdd-time">Cập nhật: {gdd.time || '—'}</span>
          </div>
        </section>



        <section className="history-panel">
          <div className="history-head">
            <div>
              <h3>📈 Biểu đồ Lịch sử</h3>
              <p className="chart-hint">Nhấn vào các thẻ cảm biến ở trên để bật/tắt đường biểu đồ tương ứng.</p>
            </div>
          </div>
          <div className="chart-box">
            <Line data={chartData as any} options={chartOptions as any} />
          </div>
        </section>

        <section className="pump-panel">
          <div className="pump-headline">
            <div>
              <h3>🚿 Điều khiển máy bơm</h3>
              <p>Auto chung bật lại tự động cho 2 bơm, manual điều khiển riêng từng bơm.</p>
            </div>

            <div className="mode-toggle">
              <button
                className={autoMode ? 'mode-button active' : 'mode-button'}
                onClick={() => setAutoMode(true)}
              >
                Auto
              </button>
              <button
                className={!autoMode ? 'mode-button active manual' : 'mode-button manual'}
                onClick={() => setAutoMode(false)}
              >
                Manual
              </button>
            </div>
          </div>

          <p className="mode-status">Chế độ hiện tại: <strong>{autoMode ? 'Tự động' : 'Thủ công'}</strong></p>

          <div className="pump-list">
            <PumpRow
              title="Máy bơm 1 (Tưới theo độ ẩm)"
              description="Auto: tự bật khi độ ẩm đất <50%"
              state={pumpState.pump1}
              auto={Boolean(pumpState.pump1Auto)}
              onToggle={() => setPump(1, !pumpState.pump1)}
            />
            <PumpRow
              title="Máy bơm 2 (Tưới theo lịch)"
              description="Auto: 07:00–07:15 & 14:00–14:15"
              state={pumpState.pump2}
              auto={Boolean(pumpState.pump2Auto)}
              onToggle={() => setPump(2, !pumpState.pump2)}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function PumpRow({ title, description, state, auto, onToggle }: {
  title: string
  description: string
  state: boolean
  auto: boolean
  onToggle: () => void
}) {
  return (
    <div className="pump-row">
      <div className="pump-copy">
        <strong>{title}</strong>
        <p>{description}</p>
        <span className={auto ? 'mini-mode auto' : 'mini-mode manual'}>
          {auto ? 'Auto đang bật' : 'Manual'}
        </span>
      </div>
      <button className={`pump-button ${state ? 'is-on' : 'is-off'}`} onClick={onToggle}>
        {state ? '🟢 ĐANG BẬT' : '🔴 ĐÃ TẮT'}
      </button>
    </div>
  )
}

export default IndexPage
