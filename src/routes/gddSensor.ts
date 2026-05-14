import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

let sensorHistory: { time: string; gdd: number }[] = []

const getTime = () =>
  new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

router.get('/gddSensor', (req: Request, res: Response) => {
  const latest = sensorHistory[sensorHistory.length - 1] ?? null
  res.json({ latest, history: sensorHistory })
})

router.post('/gddSensor', (req: Request, res: Response) => {
  const { gdd } = req.body

  if (gdd === undefined) {
    return res.status(400).json({ error: 'Missing GDD value' })
  }

  const value = Number(gdd)

  if (Number.isNaN(value)) {
    return res.status(400).json({ error: 'GDD must be a number' })
  }

  const entry = {
    time: getTime(),
    gdd: value
  }

  sensorHistory.push(entry)
  if (sensorHistory.length > 50) sensorHistory = sensorHistory.slice(-50)

  res.json({ success: true, entry })
})

export default router
