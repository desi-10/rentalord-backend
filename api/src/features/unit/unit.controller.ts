import { Request, Response } from "express";
import * as unitServices from "./unit.services.js";
import { StatusCodes } from "http-status-codes";

export const getAllUnits = async (req: Request, res: Response) => {
  const result = await unitServices.getUnitServices();
  return res.json(result);
};

export const createUnits = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const result = await unitServices.createUnitsService(userId, req.body);
  return res.status(StatusCodes.CREATED).json(result);
};

export const getUnitById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await unitServices.getUnitByIdService(id);
  res.json(result);
};

export const updateUnitController = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.userId as string;
  const result = await unitServices.updateUnitService(id, userId, req.body);
  return res.json(result);
};

export const deleteUnitById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await unitServices.deleteUnitByIdService(id);
  res.json(result);
};
