import { Request, Response } from "express";
import * as organizationService from "./organization.service.js";

export const getAllOrganizations = async (req: Request, res: Response) => {
  const result = await organizationService.getOrganizations(
    req.userId as string
  );
  res.json(result);
};

export const createOrganization = async (req: Request, res: Response) => {
  const result = await organizationService.createOrganization(
    req.userId as string,
    req.body
  );
  res.json(result);
};
