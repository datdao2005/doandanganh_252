import { Router } from 'express'
import type { Request, Response } from 'express'
import { updateLCDFromSensors } from './ledScreen.ts'

const router = Router()
let sensorHistory: { time: string; humidity: number }[] = []

const getTime = () =>
  new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

router.get('/airHumidSensor', (req: Request, res: Response) => {
  const latest = sensorHistory[sensorHistory.length - 1] ?? null
  res.json({ latest, history: sensorHistory })
})

router.post('/airHumidSensor', (req: Request, res: Response) => {
  const humidity = req.body.humidity ?? req.body.airHumidity
  if (humidity === undefined) {
    return res.status(400).json({ error: 'Missing humidity value' })
  }

  const value = Number(humidity)
  const entry = { time: getTime(), humidity: value }

  sensorHistory.push(entry)
  if (sensorHistory.length > 50) sensorHistory = sensorHistory.slice(-50)

  // Đẩy sang file ledScreen.ts để cập nhật màn hình LCD
  updateLCDFromSensors({ airHumidity: value })

  res.json({ success: true, entry })
})

export default router