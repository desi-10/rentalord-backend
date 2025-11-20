// src/controllers/property-invite.controller.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  acceptInviteService,
  createInviteService,
  deleteInviteService,
  getAllInvitesService,
  getInviteService,
  updateInviteService,
} from "./invites.service.js";

export const createInviteController = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const inviterId = req.userId as string;
  const result = await createInviteService(inviterId, businessId, req.body);
  return res.status(StatusCodes.CREATED).json(result);
};

export const getAllInvitesController = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const result = await getAllInvitesService(businessId);
  res.status(StatusCodes.OK).json(result);
};

export const getInviteController = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const id = req.params.id as string;
  const result = await getInviteService(businessId, id);
  res.status(StatusCodes.OK).json(result);
};

export const updateInviteController = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const id = req.params.id as string;
  const result = await updateInviteService(businessId, id, req.body);
  res.status(StatusCodes.OK).json(result);
};

export const deleteInviteController = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const id = req.params.id as string;
  const result = await deleteInviteService(businessId, id);
  res.status(StatusCodes.OK).json(result);
};

export const acceptInviteController = async (req: Request, res: Response) => {
  const businessId = req.businessId as string;
  const token = req.params.token as string;
  const userId = req.userId as string;
  const result = await acceptInviteService(businessId, token, userId);
  res.status(StatusCodes.OK).json(result);
};
