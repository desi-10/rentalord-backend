import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import { prisma } from "../../utils/db.js";
import { TypeCreateOrganization } from "./organization.validator.js";

export const getOrganizations = async (userId: string) => {
  const organizations = await prisma.organization.findFirst({
    where: { owner_id: userId },
  });

  return apiResponse("Organizations fetched successfully", organizations);
};

export const createOrganization = async (
  userId: string,
  data: TypeCreateOrganization
) => {
  const hasOrganization = await prisma.organization.findFirst({
    where: { owner_id: userId },
  });

  if (hasOrganization)
    throw new ApiError(
      "You can not create more than one organizations",
      StatusCodes.UNAUTHORIZED
    );

  const existingOrganization = await prisma.organization.findUnique({
    where: {
      owner_id_organization_name: {
        organization_name: data.organization_name,
        owner_id: userId,
      },
    },
  });

  if (existingOrganization)
    throw new ApiError("Organization already exists", StatusCodes.CONFLICT);

  const organization = await prisma.organization.create({
    data: {
      ...data,
      owner_id: userId,
    },
  });

  return apiResponse("Organzation created successfully", organization);
};
