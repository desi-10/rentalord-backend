import { Request, Response, NextFunction } from "express";
import prisma from "../utils/db.js";
import { ApiError } from "../utils/api-error.js";
import { StatusCodes } from "http-status-codes";

export async function membershipMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;
    const propertyId = req.propertyId as string;

    if (!userId || !propertyId)
      throw new ApiError("Missing identifiers", StatusCodes.BAD_REQUEST);

    const member = await prisma.propertyMembership.findUnique({
      where: {
        user_id_property_id: { user_id: userId, property_id: propertyId },
      },
    });

    if (!member)
      throw new ApiError(
        "Not a member of this property",
        StatusCodes.UNAUTHORIZED
      );

    (req as any).membership = member;
    next();
  } catch (err) {
    next(err);
  }
}
