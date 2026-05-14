import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

interface LCDState {
  line1: string
  line2: string
  updatedAt: string
}

let lastTemp: number | null = null
let lastAirHumidity: number | null = null
let lastSoilHumidity: number | null = null

let lcdState: LCDState = {
  line1: 'T:--C H:--%',
  line2: 'Soil: --%',
  updatedAt: ''
}

const getTime = () =>
  new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

const formatNumber = (value: number | null, digits = 1) => {
  if (value === null || Number.isNaN(value)) return '--'
  return Number.isInteger(value) ? String(value) : value.toFixed(digits)
}

const fitLCD = (text: string) => text.padEnd(16).slice(0, 16)

const rebuildLCD = () => {
  lcdState = {
    line1: fitLCD(`T:${formatNumber(lastTemp)}C H:${formatNumber(lastAirHumidity, 0)}%`),
    line2: fitLCD(`Soil:${formatNumber(lastSoilHumidity, 0)}%`),
    updatedAt: getTime()
  }

  console.log(`[LCD] Dòng 1: "${lcdState.line1}"`)
  console.log(`[LCD] Dòng 2: "${lcdState.line2}"`)
}

export const updateLCDFromSensors = (data: {
  temp?: number
  airHumidity?: number
  soilHumidity?: number
}) => {
  if (typeof data.temp === 'number' && !Number.isNaN(data.temp)) {
    lastTemp = data.temp
  }

  if (typeof data.airHumidity === 'number' && !Number.isNaN(data.airHumidity)) {
    lastAirHumidity = data.airHumidity
  }

  if (typeof data.soilHumidity === 'number' && !Number.isNaN(data.soilHumidity)) {
    lastSoilHumidity = data.soilHumidity
  }

  rebuildLCD()
}

router.get('/ledScreen', (req: Request, res: Response) => {
  res.json(lcdState)
})

export default router
