import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as subscriptionService from "./subscription.services.js";

export const createUserSubscription = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const result = await subscriptionService.createSubscriptionService(
    userId,
    req.body
  );
  res.status(StatusCodes.CREATED).json(result);
};

// export const updateSubscriptionStatus = async (req: Request, res: Response) => {
//   const result = await subscriptionService.updateSubscriptionStatus(req.body);
//   res.status(StatusCodes.OK).json(result);
// };

export const getUserActiveSubscription = async (
  req: Request,
  res: Response
) => {
  const result = await subscriptionService.getUserActiveSubscription(
    req.userId as string
  );
  res.status(StatusCodes.OK).json(result);
};

export const getAllSubscriptionsController = async (
  req: Request,
  res: Response
) => {
  const result = await subscriptionService.getAllSubscriptions();
  res.status(StatusCodes.OK).json(result);
};
