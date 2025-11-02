import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as subscriptionService from "../services/subscriptionplan.service.js";
import { ApiError } from "../../../utils/api-error.js";

export const createSubscriptionPlan = async (req: Request, res: Response) => {
  const result = await subscriptionService.createSubscriptionPlanService(
    req.body
  );
  res.status(StatusCodes.CREATED).json(result);
};

export const getAllSubscriptionPlans = async (req: Request, res: Response) => {
  const result = await subscriptionService.getAllSubscriptionPlans();
  res.status(StatusCodes.OK).json(result);
};

export const getSubscriptionPlanById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await subscriptionService.getSubscriptionPlanById(id);
  res.status(StatusCodes.OK).json(result);
};

export const updateSubscritionPlan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await subscriptionService.updateSubscriptionPlanService(
    id,
    req.body
  );
  res.status(StatusCodes.OK).json(result);
};

export const deleteSubscritionPlan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await subscriptionService.deleteSubscriptionPlanService(id);
  res.status(StatusCodes.NO_CONTENT).json(result);
};
