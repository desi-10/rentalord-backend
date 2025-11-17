import { Request, Response } from "express";
import * as propertyService from "./property.service.js";
import { StatusCodes } from "http-status-codes";

export const getAllProperties = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const result = await propertyService.getAllPropertiesService(businessId);
  res.json(result);
};

export const createProperty = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const image = req.file as Express.Multer.File;
  const result = await propertyService.createPropertyService(
    businessId,
    req.userId as string,
    req.body,
    image
  );
  res.json(result);
};

export const deletePropertyById = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const propertyId = req.params.propertyId as string;
  const result = await propertyService.deletePropertyService(
    businessId,
    propertyId
  );
  res.status(StatusCodes.NO_CONTENT).json(result);
};
