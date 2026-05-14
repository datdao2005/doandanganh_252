import { Router } from 'express'
import type { Request, Response } from 'express'
import { autoControlPump } from './pumper.ts'
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

router.get('/landSensor', (req: Request, res: Response) => {
  const latest = sensorHistory[sensorHistory.length - 1] ?? null
  res.json({ latest, history: sensorHistory })
})

router.post('/landSensor', (req: Request, res: Response) => {
  const { humidity } = req.body

  if (humidity === undefined) {
    return res.status(400).json({ error: 'Missing humidity value' })
  }

  const value = Number(humidity)

  if (Number.isNaN(value)) {
    return res.status(400).json({ error: 'Humidity must be a number' })
  }

  const entry = {
    time: getTime(),
    humidity: value
  }

  sensorHistory.push(entry)
  if (sensorHistory.length > 50) sensorHistory = sensorHistory.slice(-50)

  updateLCDFromSensors({ soilHumidity: value })
  autoControlPump(value)

  res.json({ success: true, entry })
})

export default router
