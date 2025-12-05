import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import prisma from "../../utils/db.js";
import { TypeCreateBusiness } from "./business.validator.js";

export const getAllBusinessesService = async (userId: string) => {
  const business = await prisma.business.findFirst({
    where: { owner_id: userId },
  });

  return apiResponse("Business fetched successfully", business);
};

export const createBusinessesService = async (
  userId: string,
  data: TypeCreateBusiness
) => {
  const hasBusiness = await prisma.business.findFirst({
    where: { owner_id: userId },
  });

  if (hasBusiness)
    throw new ApiError(
      "You can not create more than one business",
      StatusCodes.UNAUTHORIZED
    );

  const existingBusiness = await prisma.business.findUnique({
    where: {
      owner_id_business_name: {
        business_name: data.business_name,
        owner_id: userId,
      },
    },
  });

  if (existingBusiness)
    throw new ApiError("Business already exists", StatusCodes.CONFLICT);

  const business = await prisma.business.create({
    data: {
      ...data,
      owner_id: userId,
    },
  });

  return apiResponse("Business created successfully", business);
};
