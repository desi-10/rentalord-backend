// src/controllers/property-invite.controller.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  acceptInviteService,
  createInviteService,
  deleteInviteService,
  getInviteService,
  getInvitesService,
  updateInviteService,
} from "./invites.service.js";

export const createInviteController = async (req: Request, res: Response) => {
  const inviterId = req.userId as string;
  const result = await createInviteService(inviterId, req.body);
  return res.status(StatusCodes.CREATED).json(result);
};

export const getInvitesController = async (req: Request, res: Response) => {
  const result = await getInvitesService();
  res.status(StatusCodes.OK).json(result);
};

export const getInviteController = async (req: Request, res: Response) => {
  const result = await getInviteService(req.params.id);
  res.status(StatusCodes.OK).json(result);
};

export const updateInviteController = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await updateInviteService(id, req.body);
  res.status(StatusCodes.OK).json(result);
};

export const deleteInviteController = async (req: Request, res: Response) => {
  const result = await deleteInviteService(req.params.id);
  res.status(StatusCodes.OK).json(result);
};

export const acceptInviteController = async (req: Request, res: Response) => {
  //   const parsed = acceptInviteSchema.parse(req.body);
  const result = await acceptInviteService(req.body);
  res.status(StatusCodes.OK).json(result);
};
