import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

// ---- State ----
let pump1 = false  // máy bơm 1 (P10) - tưới tự động theo độ ẩm / thủ công
let pump2 = false  // máy bơm 2 (P13) - tưới theo giờ / thủ công

type PumpMode = 'auto' | 'schedule' | 'manual'
let mode: PumpMode = 'manual'

// ---- Ngưỡng độ ẩm (hoa cúc: 50% - 80%) ----
const HUMIDITY_LOW = 50   // bật bơm khi dưới ngưỡng này
const HUMIDITY_HIGH = 80  // tắt bơm khi đạt ngưỡng này

// ---- Lịch tưới theo giờ (hoa vạn thọ) ----
// Đổi sang phút: 7g00=420, 7g15=435, 14g00=840, 14g30=870
const SCHEDULE = [
  { start: 420, end: 435 },  // 7:00 - 7:15
  { start: 840, end: 870 },  // 14:00 - 14:30
]

// ---- Helper: thời gian hiện tại theo phút ----
const getCurrentMinutes = (): number => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// ---- Auto mode: gọi từ landSensor khi có data mới ----
export const autoControlPump = (humidity: number) => {
  if (mode !== 'auto') return

  if (humidity < HUMIDITY_LOW && !pump1) {
    pump1 = true
    console.log(`[AUTO] Độ ẩm ${humidity}% < ${HUMIDITY_LOW}% → Bật máy bơm 1`)
  } else if (humidity >= HUMIDITY_HIGH && pump1) {
    pump1 = false
    console.log(`[AUTO] Độ ẩm ${humidity}% >= ${HUMIDITY_HIGH}% → Tắt máy bơm 1`)
  }
}

// ---- Schedule mode: kiểm tra mỗi phút ----
export const scheduleControlPump = () => {
  if (mode !== 'schedule') return

  const currentMinutes = getCurrentMinutes()
  const shouldRun = SCHEDULE.some(
    slot => currentMinutes >= slot.start && currentMinutes < slot.end
  )

  if (shouldRun && !pump2) {
    pump2 = true
    console.log(`[SCHEDULE] ${currentMinutes} phút → Bật máy bơm 2`)
  } else if (!shouldRun && pump2) {
    pump2 = false
    console.log(`[SCHEDULE] ${currentMinutes} phút → Tắt máy bơm 2`)
  }
}

// Chạy schedule check mỗi 60 giây (như tài liệu)
setInterval(scheduleControlPump, 60 * 1000)

// ---- Routes ----

// GET — lấy trạng thái hiện tại
router.get('/pumper', (req: Request, res: Response) => {
  res.json({
    mode,
    pump1,
    pump2,
    thresholds: { low: HUMIDITY_LOW, high: HUMIDITY_HIGH },
    schedule: SCHEDULE
  })
})

// POST /pumper/mode — đổi chế độ tưới
router.post('/pumper/mode', (req: Request, res: Response) => {
  const { newMode } = req.body
  if (!['auto', 'schedule', 'manual'].includes(newMode)) {
    return res.status(400).json({ error: 'Mode phải là auto | schedule | manual' })
  }
  mode = newMode
  console.log(`[MODE] Chuyển sang chế độ: ${mode}`)
  res.json({ success: true, mode })
})

// POST /pumper/manual — điều khiển thủ công (V10, V11)
router.post('/pumper/manual', (req: Request, res: Response) => {
  if (mode !== 'manual') {
    return res.status(403).json({ error: `Đang ở chế độ ${mode}, không thể điều khiển thủ công` })
  }

  const { pump, state } = req.body
  if (pump === undefined || state === undefined) {
    return res.status(400).json({ error: 'Thiếu pump (1|2) hoặc state (true|false)' })
  }

  if (pump === 1) pump1 = Boolean(state)
  else if (pump === 2) pump2 = Boolean(state)
  else return res.status(400).json({ error: 'pump phải là 1 hoặc 2' })

  console.log(`[MANUAL] Máy bơm ${pump} → ${state ? 'BẬT' : 'TẮT'}`)
  res.json({ success: true, pump1, pump2 })
})

export default router