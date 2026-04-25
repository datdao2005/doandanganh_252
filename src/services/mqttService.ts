import mqtt from 'mqtt';
import dotenv from 'dotenv'
dotenv.config()

const USERNAME = process.env.VITE_AIO_USERNAME;
const AIO_KEY =process.env.VITE_AIO_KEY; 
export const setupMQTT = () => {
  if (!AIO_KEY) {
    console.error("Thiếu AIO Key! Hãy kiểm tra file .env");
    return null;
  }

  const client = mqtt.connect('wss://io.adafruit.com:443/mqtt', {
    username: USERNAME,
    password: AIO_KEY,
  });

  client.on('connect', () => {
    console.log("Đã kết nối MQTT Adafruit thành công!");
    client.subscribe(`${USERNAME}/feeds/soil-humidity`);
  });

  client.on('message', async (topic, message) => {
    const value = parseFloat(message.toString())
    if (isNaN(value)) return

    console.log(`Nhận từ ${topic}: ${value}`)

    try {
      await fetch('http://localhost:3000/api/landSensor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ humidity: value })
      })
      console.log(`Đã push humidity ${value}% vào dashboard`)
    } catch (err) {
      console.error('Lỗi push data:', err)
    }
  });

  client.on('error', (err) => console.error('MQTT error:', err))
  client.on('disconnect', () => console.log('Mất kết nối MQTT'))

  return client;
};