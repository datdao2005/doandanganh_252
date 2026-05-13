import { Router } from 'express'
import type { Request, Response } from 'express'
import { updateLCDFromSensors } from './ledScreen.ts'

const router = Router()
let sensorHistory: { time: string; humidity: number }[] = []

router.get('/airHumidSensor', (req: Request, res: Response) => {
  const latest = sensorHistory[sensorHistory.length - 1] ?? null
  res.json({ latest, history: sensorHistory })
})

router.post('/airHumidSensor', (req: Request, res: Response) => {
  const { humidity } = req.body
  if (humidity === undefined) return res.status(400).json({ error: 'Missing humidity value' })

  const entry = {
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    humidity: Number(humidity)
  }
  sensorHistory.push(entry)
  if (sensorHistory.length > 20) sensorHistory = sensorHistory.slice(-20)

  // Cập nhật màn hình LCD
  updateLCDFromSensors({ airHumidity: Number(humidity) })

  res.json({ success: true, entry })
})
export default router