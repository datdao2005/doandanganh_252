import type { Request, Response } from "express";
import AdafruitService from "../services/Adafruit.ts";

export const getHumidity = async (req: Request, res: Response) => {
  try {
    const service = AdafruitService.getInstance();
    const data = await service.getHumidity();

    return res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

export const getTemperature = async (req: Request, res: Response) => {
  try {
    const service = AdafruitService.getInstance();
    const data = await service.getTemperature();
    return res.json(data);
  
  }
  catch(err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};