import dotenv from 'dotenv'

dotenv.config()

class Adafruit {
  private static instance: Adafruit

  private readonly AIO_KEY =
    process.env.VITE_AIO_KEY ||
    process.env.AIO_KEY ||
    ''

  private readonly USERNAME =
    process.env.VITE_USERNAME ||
    process.env.AIO_USERNAME ||
    ''

  private readonly BASE_URL = `https://io.adafruit.com/api/v2/${this.USERNAME}/feeds`

  private constructor() {}

  public static getInstance(): Adafruit {
    if (!Adafruit.instance) {
      Adafruit.instance = new Adafruit()
    }

    return Adafruit.instance
  }

  private getHeaders() {
    return {
      'X-AIO-Key': this.AIO_KEY,
      'Content-Type': 'application/json'
    }
  }

  private async getLastData(feed: string) {
    const res = await fetch(`${this.BASE_URL}/${feed}/data/last`, {
      headers: this.getHeaders()
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Không đọc được feed ${feed}: ${res.status} ${text}`)
    }

    const data = await res.json()
    console.log(data)
    return data
  }

  private async sendData(feed: string, value: string | number) {
    const res = await fetch(`${this.BASE_URL}/${feed}/data`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        value: value.toString()
      })
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Không gửi được feed ${feed}: ${res.status} ${text}`)
    }

    const data = await res.json()
    console.log(data)
    return data
  }

  async getTemperature() {
    const res = await fetch(`${this.BASE_URL}/v1/data/last`, {
      headers: this.getHeaders()
    })

    const data = await res.json()
    console.log(data)
    return data
  }

  async getAirHumidity() {
    const res = await fetch(`${this.BASE_URL}/v2/data/last`, {
      headers: this.getHeaders()
    })

    const data = await res.json()
    console.log(data)
    return data
  }

  async getSoilHumidity() {
    const res = await fetch(`${this.BASE_URL}/v3/data/last`, {
      headers: this.getHeaders()
    })

    const data = await res.json()
    console.log(data)
    return data
  }

  async getLight() {
    const res = await fetch(`${this.BASE_URL}/v4/data/last`, {
      headers: this.getHeaders()
    })

    const data = await res.json()
    console.log(data)
    return data
  }

  async getGDD() {
    const res = await fetch(`${this.BASE_URL}/v5/data/last`, {
      headers: this.getHeaders()
    })

    const data = await res.json()
    console.log(data)
    return data
  }

  async getPump1Status() {
    const res = await fetch(`${this.BASE_URL}/v10/data/last`, {
      headers: this.getHeaders()
    })

    const data = await res.json()
    console.log(data)
    return data
  }

  async getPump2Status() {
    const res = await fetch(`${this.BASE_URL}/v11/data/last`, {
      headers: this.getHeaders()
    })

    const data = await res.json()
    console.log(data)
    return data
  }

  async setPump1(state: boolean) {
    return await this.sendData('v10', state ? 1 : 0)
  }

  async setPump2(state: boolean) {
    return await this.sendData('v11', state ? 1 : 0)
  }

  async getFeedLastValue(feed: string) {
    return await this.getLastData(feed.toLowerCase())
  }

  async sendFeedValue(feed: string, value: string | number) {
    return await this.sendData(feed.toLowerCase(), value)
  }
}
  // async getTriggerValue() {
  //   // FIX: Thêm headers để Adafruit cho phép đọc dữ liệu
  //   const res = await fetch(`${this.BASE_URL}/trigger-cam/data/last`, {
  //     headers: this.getHeaders()
  //   });
  //   const data = await res.json();
  //   return data.value; 
  // }

  // async sendResult(resultValue: number | string) {
  //   // FIX: Sử dụng đúng endpoint /data
  //   const url = `${this.BASE_URL}/acquaintance/data`;
  //   const res = await fetch(url, {
  //     method: 'POST',
  //     headers: this.getHeaders(),
  //     body: JSON.stringify({ value: resultValue.toString() })
  //   });
  //   return await res.json();
  // }

  // Trong file src/services/adaFruitservice.ts

// async sendTriggerValue(value: number) {
//     // FIX 3: Sử dụng USERNAME và AIO_KEY của Class thay vì process.env bị lỗi
//     try {
//       const response = await fetch(`${this.BASE_URL}/trigger-cam/data`, {
//         method: 'POST',
//         headers: this.getHeaders(),
//         body: JSON.stringify({ value: value.toString() }),
//       });

//       if (!response.ok) console.error("Lỗi khi reset trigger trên Adafruit");
//     } catch (error) {
//       console.error("Network error khi gọi Adafruit:", error);
//     }
//   }


export default Adafruit;