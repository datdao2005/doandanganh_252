import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()
let currentColor = '#000000' // OFF mặc định

router.get('/rgbLight', (req: Request, res: Response) => {
  res.json({ color: currentColor })
})

// ---- Hàm tự động điều khiển đèn theo nhiệt độ ----
export const autoControlLightByTemp = (temp: number) => {
  let newColor = currentColor

  if (temp >= 35) {
    newColor = '#e53e3e' // Đỏ (Cảnh báo nóng)
  } else if (temp >= 20 && temp < 35) {
    newColor = '#38a169' // Xanh lá (Lý tưởng / Thu hoạch)
  } else {
    newColor = '#000000' // Tắt đèn (Dưới 20 độ)
  }

  if (newColor !== currentColor) {
    currentColor = newColor
    console.log(`[RGB LIGHT AUTO] Nhiệt độ đo được: ${temp}°C -> Đổi màu đèn tự động sang: ${currentColor}`)
  }
}

// ---- Điều khiển thủ công qua Web ----
router.post('/rgbLight/color', (req: Request, res: Response) => {
  const { color } = req.body
  if (color !== undefined) {
    currentColor = color
    console.log(`[RGB LIGHT] Đổi màu đèn sang: ${currentColor}`)
  }
  res.json({ success: true, color: currentColor })
})
export default router