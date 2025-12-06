import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import prisma from "../../utils/db.js";
import { TypeUnitSchema, TypeUpdateUnitSchema } from "./unit.validator.js";
import {
  deleteFromCloudinary,
  uploadMultipleImages,
  uploadToCloudinary,
} from "../../utils/cloudinary.js";

export const getAllUnitsService = async (
  businessId: string,
  propertyId?: string
) => {
  const where: any = {
    property: {
      business_id: businessId,
    },
  };

  if (propertyId) {
    // Verify property belongs to business
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        business_id: businessId,
      },
    });

    if (!property) {
      throw new ApiError("Property not found", StatusCodes.NOT_FOUND);
    }

    where.property_id = propertyId;
  }

  const units = await prisma.unit.findMany({
    where,
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      name: true,
      type: true,
      rent_amount: true,
      status: true,
      description: true,
      property_id: true,
      created_at: true,
      updated_at: true,
      property: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      images: {
        select: {
          image_url: true,
        },
      },
    },
  });

  return apiResponse("Units fetched successfully", units);
};

export const createUnitService = async (
  businessId: string,
  data: TypeUnitSchema,
  images: Express.Multer.File[]
) => {
  const { name, property_id, rent_amount, type, description, status } = data;

  // Verify property belongs to business
  const property = await prisma.property.findFirst({
    where: {
      id: property_id,
      business_id: businessId,
    },
  });

  if (!property) {
    throw new ApiError("Property not found", StatusCodes.NOT_FOUND);
  }

  // Check if unit with same name already exists in this property
  const existingUnit = await prisma.unit.findUnique({
    where: {
      name_property_id: { name, property_id },
    },
  });

  if (existingUnit) {
    throw new ApiError("Unit already exists", StatusCodes.CONFLICT);
  }

  const unitImages: { image_url: string; image_public_id: string }[] = [];

  const uploadedImages = await uploadMultipleImages("units", images);

  const result = await prisma.$transaction(async (tx) => {
    const unit = await tx.unit.create({
      data: {
        name,
        property_id,
        rent_amount,
        type,
        description,
        status: status || "available",
      },
    });

    const unitImages = await tx.unitImage.createMany({
      data: uploadedImages.map((image) => ({
        unit_id: unit.id,
        image_url: image.image_url,
        image_public_id: image.image_public_id,
      })),
    });

    return { unit, unitImages };
  });

  return apiResponse("Unit created successfully", result);
};

export const getUnitByIdService = async (
  businessId: string,
  unitId: string
) => {
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      property: {
        business_id: businessId,
      },
    },
    select: {
      id: true,
      name: true,
      type: true,
      rent_amount: true,
      status: true,
      description: true,
      property_id: true,
      created_at: true,
      updated_at: true,
      property: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      images: {
        select: {
          image_url: true,
        },
      },
    },
  });

  if (!unit) {
    throw new ApiError("Unit not found", StatusCodes.NOT_FOUND);
  }

  return apiResponse("Unit fetched successfully", unit);
};

export const updateUnitService = async (
  businessId: string,
  unitId: string,
  data: TypeUpdateUnitSchema,
  images: Express.Multer.File[]
) => {
  // Verify unit exists and belongs to business
  const existingUnit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      property: {
        business_id: businessId,
      },
    },
    include: {
      property: true,
      images: {
        select: {
          image_public_id: true,
        },
      },
    },
  });

  if (!existingUnit) {
    throw new ApiError("Unit not found", StatusCodes.NOT_FOUND);
  }

  const {
    name,
    property_id,
    rent_amount,
    type,
    description,
    status,
    is_public,
  } = data;

  // If property_id is being updated, verify new property belongs to business
  if (property_id && property_id !== existingUnit.property_id) {
    const newProperty = await prisma.property.findFirst({
      where: {
        id: property_id,
        business_id: businessId,
      },
    });

    if (!newProperty) {
      throw new ApiError("Property not found", StatusCodes.NOT_FOUND);
    }
  }

  // If name is being updated, check for conflicts
  if (name && name !== existingUnit.name) {
    const propertyIdToCheck = property_id || existingUnit.property_id;
    const conflictingUnit = await prisma.unit.findUnique({
      where: {
        name_property_id: {
          name,
          property_id: propertyIdToCheck,
        },
      },
    });

    if (conflictingUnit && conflictingUnit.id !== unitId) {
      throw new ApiError(
        "A unit with this name already exists in this property",
        StatusCodes.CONFLICT
      );
    }
  }

  // Handle image uploads and deletions
  let uploadedImages: { image_url: string; image_public_id: string }[] = [];
  if (images && images.length > 0) {
    uploadedImages = await uploadMultipleImages("units", images);

    // Delete old images from Cloudinary
    if (existingUnit.images && existingUnit.images.length > 0) {
      await Promise.all(
        existingUnit.images.map((img: { image_public_id: string }) =>
          deleteFromCloudinary(img.image_public_id)
        )
      );
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    // Delete existing images if new ones are being uploaded
    if (uploadedImages.length > 0) {
      await tx.unitImage.deleteMany({
        where: { unit_id: unitId },
      });
    }

    // Update unit
    const unit = await tx.unit.update({
      where: { id: unitId },
      data: {
        ...(name && { name }),
        ...(property_id && { property_id }),
        ...(rent_amount !== undefined && { rent_amount }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(is_public !== undefined && { is_public }),
      },
    });

    // Create new images if any were uploaded
    if (uploadedImages.length > 0) {
      await tx.unitImage.createMany({
        data: uploadedImages.map((image) => ({
          unit_id: unitId,
          image_url: image.image_url,
          image_public_id: image.image_public_id,
        })),
      });
    }

    // Fetch updated unit with images
    const updatedUnit = await tx.unit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        name: true,
        type: true,
        rent_amount: true,
        status: true,
        description: true,
        property_id: true,
        is_public: true,
        created_at: true,
        updated_at: true,
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        images: {
          select: {
            image_url: true,
          },
        },
      },
    });

    return updatedUnit;
  });

  return apiResponse("Unit updated successfully", result);
};

export const deleteUnitService = async (businessId: string, unitId: string) => {
  // Verify unit exists and belongs to business
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      property: {
        business_id: businessId,
      },
    },
  });

  if (!unit) {
    throw new ApiError("Unit not found", StatusCodes.NOT_FOUND);
  }

  await prisma.unit.delete({
    where: { id: unitId },
  });

  return apiResponse("Unit deleted successfully", null);
};
