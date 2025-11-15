import { Request, Response } from "express";
import * as businessService from "./business.service.js";

export const getAllBusinesses = async (req: Request, res: Response) => {
  const result = await businessService.getAllBusinessesService(
    req.userId as string
  );
  res.json(result);
};

export const createBusiness = async (req: Request, res: Response) => {
  const result = await businessService.createBusinessesService(
    req.userId as string,
    req.body
  );
  res.json(result);
};
