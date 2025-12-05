import { NextFunction, Request, Response } from "express";
import prisma from "../utils/db.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/api-error.js";
import { z } from "zod";

const businessSchema = z.object({
  business_id: z.string().min(1),
});

export async function businessMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = req.headers["x-business-id"] as string | undefined;

    const parsed = businessSchema.safeParse({ business_id: businessId });
    if (!parsed.success)
      throw new ApiError("Invalid business ID", StatusCodes.BAD_REQUEST);

    const business = await prisma.business.findUnique({
      where: {
        id: parsed.data.business_id,
      },
    });

    if (!business)
      throw new ApiError("Business not found", StatusCodes.NOT_FOUND);

    (req as any).businessId = business.id;
    next();
  } catch (err) {
    next(err);
  }
}
