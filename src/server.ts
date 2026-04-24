import express from 'express';
import type { Request, Response } from 'express';
import login from './routes/login.ts';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', login);

app.get('/', (req: Request, res: Response) => {
    res.send("Hello IOT project!");
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});