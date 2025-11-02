// src/features/users/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as userService from "../services/users.services.js";

export const createUser = async (req: Request, res: Response) => {
  const result = await userService.createUser(req.body);
  res.status(StatusCodes.CREATED).json(result);
};
export const getAllUsers = async (req: Request, res: Response) => {
  const result = await userService.getAllUsers();
  res.status(StatusCodes.OK).json(result);
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.userId as string);
  res.status(StatusCodes.OK).json(result);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.status(StatusCodes.OK).json({ success: true, data: user });
};

export const updateCurentUser = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const result = await userService.updateUser(userId, req.body);
  res.status(StatusCodes.OK).json(result);
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const result = await userService.updateUser(userId, req.body);
  res.status(StatusCodes.OK).json(result);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.deleteUser(id);
  res.status(StatusCodes.NO_CONTENT).json(result);
};
