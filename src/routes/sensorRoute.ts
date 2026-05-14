import express from 'express'

const router = express.Router()

// Route cũ để tránh crash nếu frontend cũ còn gọi.
// Dữ liệu chính hiện nằm ở: /api/tempSensor, /api/airHumidSensor, /api/landSensor, /api/lightSensor.
router.get('/humidity', (req, res) => {
  res.json({ message: 'Use /api/airHumidSensor or /api/landSensor instead.' })
})

router.get('/temperature', (req, res) => {
  res.json({ message: 'Use /api/tempSensor instead.' })
})

export default router
