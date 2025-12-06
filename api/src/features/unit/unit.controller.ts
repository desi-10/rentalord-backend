import { Request, Response } from "express";
import * as unitService from "./unit.services.js";
import { StatusCodes } from "http-status-codes";

export const getAllUnits = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const propertyId = req.query.propertyId as string | undefined;
  const result = await unitService.getAllUnitsService(businessId, propertyId);
  res.json(result);
};

export const createUnit = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const images = req.files as Express.Multer.File[];
  const result = await unitService.createUnitService(
    businessId,
    req.body,
    images
  );
  res.status(StatusCodes.CREATED).json(result);
};

export const getUnitById = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const unitId = req.params.unitId as string;
  const result = await unitService.getUnitByIdService(businessId, unitId);
  res.json(result);
};

export const updateUnitById = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const unitId = req.params.unitId as string;
  const images = req.files as Express.Multer.File[];
  const result = await unitService.updateUnitService(
    businessId,
    unitId,
    req.body,
    images
  );
  res.json(result);
};

export const deleteUnitById = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const unitId = req.params.unitId as string;
  const result = await unitService.deleteUnitService(businessId, unitId);
  res.status(StatusCodes.NO_CONTENT).json(result);
};
