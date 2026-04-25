import { Router } from 'express'
import type { Request, Response } from 'express'
import { getCurrentTime} from '../utils/time.ts'
const router = Router()

// ---- State LCD hiện tại ----
interface LCDState {
  line1: string  // dòng 1: nhiệt độ & độ ẩm không khí
  line2: string  // dòng 2: độ ẩm đất
  updatedAt: string
}

let lcdState: LCDState = {
  line1: 'Temp: --  Hum: --',
  line2: 'Soil: --%',
  updatedAt: ''
}

// ---- Helper: format nội dung LCD (tối đa 16 ký tự/dòng) ----
const formatLine1 = (temp: number, airHumidity: number): string => {
  // LCD 16x2: "T:25C  H:60%    " (16 ký tự)
  return `T:${temp}C  H:${airHumidity}%`.padEnd(16).slice(0, 16)
}

const formatLine2 = (soilHumidity: number): string => {
  // "Soil: 75%       " (16 ký tự)
  return `Soil: ${soilHumidity}%`.padEnd(16).slice(0, 16)
}

// ---- Hàm này được gọi từ các route khác khi có data mới ----
export const updateLCDFromSensors = (data: {
  temp?: number
  airHumidity?: number
  soilHumidity?: number
}) => {
  const current = lcdState

  // Giữ lại giá trị cũ nếu không có data mới
  const tempMatch = current.line1.match(/T:(\d+)C/)
  const airMatch = current.line1.match(/H:(\d+)%/)
  const soilMatch = current.line2.match(/Soil: (\d+)%/)

  const temp = data.temp ?? (tempMatch ? Number(tempMatch[1]) : 0)
  const airHumidity = data.airHumidity ?? (airMatch ? Number(airMatch[1]) : 0)
  const soilHumidity = data.soilHumidity ?? (soilMatch ? Number(soilMatch[1]) : 0)

  lcdState = {
    line1: formatLine1(temp, airHumidity),
    line2: formatLine2(soilHumidity),
    updatedAt: getCurrentTime()
  }

  console.log(`[LCD] Dòng 1: "${lcdState.line1}"`)
  console.log(`[LCD] Dòng 2: "${lcdState.line2}"`)
}

// ---- GET — frontend lấy trạng thái LCD để preview ----
router.get('/ledScreen', (req: Request, res: Response) => {
  res.json(lcdState)
})

export default router