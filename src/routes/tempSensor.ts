import { Router } from 'express'
import type { Request, Response } from 'express'
import { updateLCDFromSensors } from './ledScreen.ts'
import { autoControlLightByTemp } from './rgbLight.ts'

const router = Router()

let sensorHistory: { time: string; temperature: number }[] = []

const getTime = () =>
  new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

router.get('/tempSensor', (req: Request, res: Response) => {
  const latest = sensorHistory[sensorHistory.length - 1] ?? null
  res.json({ latest, history: sensorHistory })
})

router.post('/tempSensor', (req: Request, res: Response) => {
  const { temp } = req.body

  if (temp === undefined) {
    return res.status(400).json({ error: 'Missing temperature value' })
  }

  const temperature = Number(temp)

  if (Number.isNaN(temperature)) {
    return res.status(400).json({ error: 'Temperature must be a number' })
  }

  const entry = {
    time: getTime(),
    temperature
  }

  sensorHistory.push(entry)
  if (sensorHistory.length > 50) sensorHistory = sensorHistory.slice(-50)

  updateLCDFromSensors({ temp: temperature })
  autoControlLightByTemp(temperature)

  res.json({ success: true, entry })
})

export default router
