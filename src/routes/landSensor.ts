import {Router} from 'express'
import type {Request, Response } from 'express'
import { autoControlPump } from './pumper.ts'

import { updateLCDFromSensors } from './ledScreen.ts'

const router = Router()

// Lưu tạm trong memory (sau có thể thay bằng DB)
let sensorHistory: { time: string; humidity: number }[] = []

// GET — frontend fetch để hiển thị
router.get('/landSensor', (req: Request, res: Response) => {
  const latest = sensorHistory[sensorHistory.length - 1] ?? null
  res.json({ latest, history: sensorHistory })
})

// POST — Yolo:Bit hoặc MQTT push data vào đây
router.post('/landSensor', (req: Request, res: Response) => {
  const { humidity } = req.body
  if (humidity === undefined) {
    return res.status(400).json({ error: 'Missing humidity value' })
  }

  const entry = {
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    humidity: Number(humidity)
  }

  sensorHistory.push(entry)
  if (sensorHistory.length > 20) sensorHistory = sensorHistory.slice(-20)

   autoControlPump(Number(humidity))
  res.json({ success: true, entry })
})

export default router