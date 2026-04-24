import mqtt from 'mqtt';

// Lấy thông tin từ .env để GitHub không chặn được
const USERNAME = import.meta.env.VITE_AIO_USERNAME || 'KenElem';
const AIO_KEY = import.meta.env.VITE_AIO_KEY; 

export const setupMQTT = (onTrigger: () => void) => {
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
    // Subscribe vào feed trigger
    client.subscribe(`${USERNAME}/feeds/trigger-feed`);
  });

  client.on('message', (topic, message) => {
    if (message.toString() === '1') {
      console.log("Nhận lệnh Trigger từ thiết bị ngoại vi!");
      onTrigger(); // Chạy hàm kích hoạt camera
    }
  });

  return client;
};