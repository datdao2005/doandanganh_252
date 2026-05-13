import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()
let sensorHistory: { time: string; light: number }[] = []

router.get('/lightSensor', (req: Request, res: Response) => {
  const latest = sensorHistory[sensorHistory.length - 1] ?? null
  res.json({ latest, history: sensorHistory })
})

router.post('/lightSensor', (req: Request, res: Response) => {
  const { light } = req.body
  if (light === undefined) return res.status(400).json({ error: 'Missing light value' })

  const entry = {
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    light: Number(light)
  }
  sensorHistory.push(entry)
  if (sensorHistory.length > 20) sensorHistory = sensorHistory.slice(-20)
  res.json({ success: true, entry })
})
export default router