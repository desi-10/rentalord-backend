import { Request, Response } from "express";
import * as organizationService from "./organization.service.js";

export const getAllOrganizations = (req: Request, res: Response) => {
  const result = organizationService.getOrganizations(req.userId as string);
  res.json(result);
};
