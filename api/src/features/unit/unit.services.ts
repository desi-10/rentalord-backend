import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import prisma from "../../utils/db.js";
import { TypeUnitSchema, TypeUpdateUnitSchema } from "./unit.validator.js";
import { findUnitById } from "./unit.util.js";

export const getUnitServices = async () => {
  const units = await prisma.unit.findMany();
  return apiResponse("Units fetched succesffuly", units);
};

export const createUnitsService = async (
  userId: string,
  data: TypeUnitSchema
) => {
  const { name, property_id, rent_amount, type, description, status } = data;

  const existingUnit = await prisma.unit.findUnique({
    where: {
      name_property_id: { name, property_id },
    },
  });

  if (existingUnit)
    throw new ApiError("Unit already exists", StatusCodes.CONFLICT);

  const result = await prisma.$transaction(async (tx) => {
    const unit = await tx.unit.create({
      data: {
        name,
        property_id,
        rent_amount,
        type,
        description,
        status,
      },
    });

    if (data.tenancies?.length) {
      const tenancyData = data.tenancies.map((t) => ({
        ...t,
        unit_id: unit.id,
        property_id: unit.property_id,
      }));
      await tx.tenancy.createMany({ data: tenancyData });
    }

    if (data.maintenanceRequests?.length) {
      const maintenanceData = data.maintenanceRequests.map((m) => ({
        ...m,
        unit_id: unit.id,
        property_id: unit.property_id,
        reported_by: userId,
        request_date: new Date(),
        requested_by: userId,
      }));
      await tx.maintenanceRequest.createMany({ data: maintenanceData });
    }

    return unit;
  });

  return apiResponse("Unit created successfully", result);
};

export const getUnitByIdService = async (id: string) => {
  const existingUnit = await findUnitById(id);
  if (existingUnit)
    throw new ApiError("Unit already exist", StatusCodes.CONFLICT);

  return apiResponse("Unit fetced successfully", existingUnit);
};

export const updateUnitService = async (
  id: string,
  userId: string,
  data: TypeUpdateUnitSchema
) => {
  const { name, property_id, rent_amount, type, description, status } = data;
  const existingUnit = await findUnitById(id);
  if (existingUnit)
    throw new ApiError("Unit already exist", StatusCodes.CONFLICT);

  const result = await prisma.$transaction(async (tx) => {
    const unit = await tx.unit.update({
      where: { id },
      data: {
        name,
        property_id,
        rent_amount,
        type,
        description,
        status,
      },
    });

    if (data.tenancies?.length) {
      const tenancyData = data.tenancies.map((t) => ({
        ...t,
        unit_id: unit.id,
        property_id: unit.property_id,
      }));
      await tx.tenancy.createMany({ data: tenancyData });
    }

    if (data.maintenanceRequests?.length) {
      const maintenanceData = data.maintenanceRequests.map((m) => ({
        ...m,
        unit_id: unit.id,
        property_id: unit.property_id,
        reported_by: userId,
        request_date: new Date(),
        requested_by: userId,
      }));
      await tx.maintenanceRequest.createMany({ data: maintenanceData });
    }

    return unit;
  });

  return apiResponse("Unit updated successfully", result);
};

export const deleteUnitByIdService = async (id: string) => {
  const existingUnit = await findUnitById(id);
  if (existingUnit)
    throw new ApiError("Unit already exist", StatusCodes.CONFLICT);

  await prisma.unit.delete({ where: { id } });
  return apiResponse("Unit deleted successfully", null);
};
