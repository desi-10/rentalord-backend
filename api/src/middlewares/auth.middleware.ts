import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/db.js";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/api-error.js";
import { StatusCodes } from "http-status-codes";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new ApiError("Invalid token", StatusCodes.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1];
  // try {
  const payload = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  if (!user) throw new ApiError("Invalid token", StatusCodes.UNAUTHORIZED);

  // attach to request for downstream handlers
  (req as any).userId = user.id;
  (req as any).role = user.role;

  next();
  // } catch (err) {
  //   next(err);
  // }
}

// 🛡 authorize admin middleware
export function authorizeAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(req as any).userId) {
    throw new ApiError("No user", StatusCodes.UNAUTHORIZED);
  }
  if ((req as any).role !== "ADMIN") {
    throw new ApiError("Not an admin", StatusCodes.FORBIDDEN);
  }
  next();
}
