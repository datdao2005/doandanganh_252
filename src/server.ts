import dotenv from 'dotenv'
dotenv.config()

import express from 'express';
import type { Request, Response } from 'express';
import login from './routes/login.ts';
import sensorRoute from './routes/sensorRoute.ts'
import ledScreen from './routes/ledScreen.ts'
import landSensor from './routes/landSensor.ts'
import pumper from './routes/pumper.ts'
import {setupMQTT}  from './services/mqttService.ts'
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', sensorRoute);
app.use('/api', login);
app.use('/api', ledScreen);
app.use('/api', landSensor);
app.use('/api', pumper);
app.get('/', (req: Request, res: Response) => {
    res.send("Hello IOT project!");
});



app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT)
  setupMQTT()  // ← thêm dòng này
});