import { apiResponse } from "../../utils/api-response.js";
import { prisma } from "../../utils/db.js";

export const getOrganizations = async (userId: string) => {
  const organizations = await prisma.organization.findFirst({
    where: { owner_id: userId },
  });

  return apiResponse("Organizations fetched successfully", organizations);
};
