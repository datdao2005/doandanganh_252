import mqtt, { MqttClient } from 'mqtt'
import dotenv from 'dotenv'

dotenv.config()

const USERNAME = process.env.AIO_USERNAME
const AIO_KEY = process.env.AIO_KEY
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api'

let mqttClient: MqttClient | null = null

const FEEDS = ['v1', 'v2', 'v3', 'v4', 'v5', 'v10', 'v11', 'v12']

const postData = async (endpoint: string, body: object) => {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[MQTT] Lỗi POST /api/${endpoint}:`, res.status, text)
      return
    }

    console.log(`[MQTT] Đã push tới /api/${endpoint}`)
  } catch (err) {
    console.error(`[MQTT] Không gọi được /api/${endpoint}:`, err)
  }
}

export const setupMQTT = () => {
  if (!USERNAME || !AIO_KEY) {
    console.error('[MQTT] Thiếu AIO_USERNAME hoặc AIO_KEY. Hãy kiểm tra file .env')
    return null
  }

  if (mqttClient) return mqttClient

  const client = mqtt.connect('wss://io.adafruit.com:443/mqtt', {
    username: USERNAME,
    password: AIO_KEY,
    clientId: `smartfarm_${Math.random().toString(16).slice(2)}`,
    reconnectPeriod: 5000,
    keepalive: 60,
  })

  mqttClient = client

  client.on('connect', () => {
    console.log('[MQTT] Đã kết nối Adafruit IO!')

    FEEDS.forEach(feed => {
      client.subscribe(`${USERNAME}/feeds/${feed}`, err => {
        if (err) console.error(`[MQTT] Lỗi khi đăng ký kênh ${feed}:`, err)
        else console.log(`[MQTT] Đã đăng ký kênh ${feed}`)
      })
    })
  })

  client.on('message', async (topic, message) => {
    const rawValue = message.toString()
    const value = Number(rawValue)
    const feedKey = (topic.split('/').pop() || '').toLowerCase()

    if (!FEEDS.includes(feedKey)) return

    if (Number.isNaN(value)) {
      console.warn(`[MQTT] Dữ liệu không phải số từ ${topic}: ${rawValue}`)
      return
    }

    console.log(`[MQTT] Nhận từ ${feedKey}: ${value}`)

    switch (feedKey) {
      case 'v1':
        await postData('tempSensor', { temp: value })
        break
      case 'v2':
        await postData('airHumidSensor', { humidity: value })
        break
      case 'v3':
        await postData('landSensor', { humidity: value })
        break
      case 'v4':
        await postData('lightSensor', { light: value })
        break
      case 'v5':
        await postData('gddSensor', { gdd: value })
        break
      case 'v10':
      case 'v11':
      case 'v12':
        await postData('pumper/mqtt-state', {
          feedKey,
          state: value === 1,
        })
        break
    }
  })

  client.on('error', err => console.error('[MQTT] MQTT error:', err))
  client.on('close', () => console.log('[MQTT] Kết nối MQTT đã đóng.'))
  client.on('reconnect', () => console.log('[MQTT] Đang thử kết nối lại MQTT...'))
  client.on('offline', () => console.log('[MQTT] MQTT offline.'))

  return client
}

export const publishData = (feed: string, value: string | number) => {
  const feedKey = feed.toLowerCase()

  if (!mqttClient || !USERNAME) {
    console.warn('[MQTT] Chưa khởi tạo MQTT client, không thể gửi lệnh.')
    return false
  }

  if (!mqttClient.connected) {
    console.warn('[MQTT] MQTT chưa connected, không thể gửi lệnh ngay lúc này.')
    return false
  }

  mqttClient.publish(`${USERNAME}/feeds/${feedKey}`, value.toString(), err => {
    if (err) console.error(`[MQTT] Lỗi gửi xuống ${feedKey}:`, err)
    else console.log(`[MQTT] Đã gửi lệnh xuống ${feedKey}: ${value}`)
  })

  return true
}
