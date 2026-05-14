import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

let currentColor = '#000000'
let mode: 'auto' | 'manual' = 'auto'

router.get('/rgbLight', (req: Request, res: Response) => {
  res.json({ color: currentColor, mode })
})

export const autoControlLightByTemp = (temp: number) => {
  if (mode !== 'auto') return

  let newColor = '#000000'

  if (temp >= 35) {
    newColor = '#e53e3e'
  } else if (temp >= 20) {
    newColor = '#38a169'
  }

  if (newColor !== currentColor) {
    currentColor = newColor
    console.log(`[RGB AUTO] Nhiệt độ ${temp}°C → ${currentColor}`)
  }
}

router.post('/rgbLight/color', (req: Request, res: Response) => {
  const { color } = req.body

  if (typeof color !== 'string') {
    return res.status(400).json({ error: 'Missing color value' })
  }

  currentColor = color
  mode = 'manual'
  console.log(`[RGB MANUAL] Đổi màu đèn sang: ${currentColor}`)

  res.json({ success: true, color: currentColor, mode })
})

router.post('/rgbLight/mode', (req: Request, res: Response) => {
  const { newMode } = req.body

  if (!['auto', 'manual'].includes(newMode)) {
    return res.status(400).json({ error: 'Mode phải là auto hoặc manual' })
  }

  mode = newMode
  res.json({ success: true, color: currentColor, mode })
})

export default router
