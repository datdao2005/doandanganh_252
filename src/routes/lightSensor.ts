import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()
let sensorHistory: { time: string; light: number }[] = []

const getTime = () =>
  new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

router.get('/lightSensor', (req: Request, res: Response) => {
  const latest = sensorHistory[sensorHistory.length - 1] ?? null
  res.json({ latest, history: sensorHistory })
})

router.post('/lightSensor', (req: Request, res: Response) => {
  const light = req.body.light ?? req.body.lux
  if (light === undefined) {
    return res.status(400).json({ error: 'Missing light value' })
  }

  const value = Number(light)
  const entry = { time: getTime(), light: value }

  sensorHistory.push(entry)
  if (sensorHistory.length > 50) sensorHistory = sensorHistory.slice(-50)

  res.json({ success: true, entry })
})

export default router