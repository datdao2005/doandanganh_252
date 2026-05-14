import { Router } from 'express'
import type { Request, Response } from 'express'
import { publishData } from '../services/mqttService.ts'

const router = Router()

let pump1 = false
let pump2 = false
let pump1Auto = true
let pump2Auto = true

const HUMIDITY_LOW = 50
const HUMIDITY_HIGH = 80

let SCHEDULE = [
  { start: 420, end: 435 },
  { start: 840, end: 870 },
]

const toBool = (value: unknown) => value === true || value === 1 || value === '1'

const getCurrentMinutes = (): number => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

const getPayload = () => ({
  pump1,
  pump2,
  pump1Auto,
  pump2Auto,
  autoMode: pump1Auto && pump2Auto,
  thresholds: { low: HUMIDITY_LOW, high: HUMIDITY_HIGH },
  schedule: SCHEDULE,
})

export const autoControlPump = (humidity: number) => {
  if (!pump1Auto) return

  if (humidity < HUMIDITY_LOW && !pump1) {
    pump1 = true
    console.log(`[AUTO] Độ ẩm ${humidity}% < ${HUMIDITY_LOW}% → BẬT bơm 1`)
    publishData('v10', 1)
  } else if (humidity >= HUMIDITY_HIGH && pump1) {
    pump1 = false
    console.log(`[AUTO] Độ ẩm ${humidity}% >= ${HUMIDITY_HIGH}% → TẮT bơm 1`)
    publishData('v10', 0)
  }
}

export const scheduleControlPump = () => {
  if (!pump2Auto) return

  const currentMinutes = getCurrentMinutes()
  const shouldRun = SCHEDULE.some(
    slot => currentMinutes >= slot.start && currentMinutes < slot.end
  )

  if (shouldRun && !pump2) {
    pump2 = true
    console.log(`[SCHEDULE] ${currentMinutes} phút → BẬT bơm 2`)
    publishData('v11', 1)
  } else if (!shouldRun && pump2) {
    pump2 = false
    console.log(`[SCHEDULE] ${currentMinutes} phút → TẮT bơm 2`)
    publishData('v11', 0)
  }
}

setInterval(scheduleControlPump, 60 * 1000)

router.get('/pumper', (_req: Request, res: Response) => {
  res.json(getPayload())
})

router.post('/pumper/manual', (req: Request, res: Response) => {
  const { pump, state } = req.body

  if (pump === undefined || state === undefined) {
    return res.status(400).json({ error: 'Thiếu pump (1|2) hoặc state (true|false)' })
  }

  const nextState = Boolean(state)

  if (pump === 1) {
    pump1 = nextState
    pump1Auto = false
    publishData('v10', pump1 ? 1 : 0)
  } else if (pump === 2) {
    pump2 = nextState
    pump2Auto = false
    publishData('v11', pump2 ? 1 : 0)
  } else {
    return res.status(400).json({ error: 'pump phải là 1 hoặc 2' })
  }

  console.log(`[MANUAL] Bơm ${pump} → ${nextState ? 'BẬT' : 'TẮT'}`)
  res.json({ success: true, ...getPayload() })
})

router.post('/pumper/auto', (req: Request, res: Response) => {
  const { state } = req.body

  if (state === undefined) {
    return res.status(400).json({ error: 'Thiếu state (true|false)' })
  }

  const autoState = Boolean(state)
  pump1Auto = autoState
  pump2Auto = autoState

  publishData('v12', autoState ? 1 : 0)

  console.log(`[AUTO MODE] ${autoState ? 'BẬT' : 'TẮT'} tự động cho cả 2 bơm`)
  res.json({ success: true, ...getPayload() })
})

router.post('/pumper/schedule', (req: Request, res: Response) => {
  const { newSchedule } = req.body

  if (!Array.isArray(newSchedule) || !newSchedule.every(s => typeof s.start === 'number' && typeof s.end === 'number')) {
    return res.status(400).json({ error: 'Lịch tưới không hợp lệ' })
  }

  SCHEDULE = newSchedule
  scheduleControlPump()
  res.json({ success: true, ...getPayload() })
})

router.post('/pumper/mqtt-state', (req: Request, res: Response) => {
  const { feedKey, state } = req.body
  const incomingState = toBool(state)

  if (feedKey === 'v10') {
    pump1 = incomingState
  } else if (feedKey === 'v11') {
    pump2 = incomingState
  } else if (feedKey === 'v12') {
    pump1Auto = incomingState
    pump2Auto = incomingState
  } else {
    return res.status(400).json({ error: 'feedKey phải là v10, v11 hoặc v12' })
  }

  console.log(`[MQTT → PUMPER] ${feedKey} = ${incomingState ? '1/BẬT' : '0/TẮT'}`)
  res.json({ success: true, ...getPayload() })
})

export default router
