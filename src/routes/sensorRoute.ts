import express from "express";
import { getHumidity, getTemperature } from "../controllers/sensor.ts";

const router = express.Router();

router.get("/humidity", getHumidity);
router.get("/temperature", getTemperature);

export default router;
