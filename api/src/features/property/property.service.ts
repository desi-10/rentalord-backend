import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import { prisma } from "../../utils/db.js";
import {
  createPropertySchema,
  TypeCreateProperty,
} from "./property.validator.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary.js";

export const getAllPropertiesService = async (businessId: string) => {
  const properties = await prisma.property.findMany({
    where: { business_id: businessId },
    select: {
      id: true,
      name: true,
      address: true,
      image_url: true,
      is_public: true,
      number_of_units: true,
      description: true,
      verification_status: true,
      created_at: true,
      updated_at: true,
    },
  });

  return apiResponse("Properties fetched successfully", properties);
};

export const createPropertyService = async (
  businessId: string,
  userId: string,
  data: TypeCreateProperty,
  image: Express.Multer.File
) => {
  const {
    name,
    address,
    description,
    number_of_units,
    is_public,
    verification_status,
  } = data;

  console.log("data in service", data);

  const existingProperty = await prisma.property.findUnique({
    where: {
      name_business_id: {
        name,
        business_id: businessId,
      },
    },
  });

  if (existingProperty)
    throw new ApiError("Property already exists", StatusCodes.CONFLICT);

  let imageUrl = null;
  let public_id = null;
  if (image) {
    const uploadedImage = await uploadToCloudinary("properties", image.buffer);
    imageUrl = uploadedImage.secure_url;
    public_id = uploadedImage.public_id;
  }

  const property = await prisma.property.create({
    data: {
      name,
      address,
      description,
      number_of_units,
      is_public,
      verification_status,
      created_by_id: userId,
      business_id: businessId,
      image_url: imageUrl,
      image_public_id: public_id,
    },
  });

  return apiResponse("Property created successfully", property);
};

export const deletePropertyService = async (
  businessId: string,
  propertyId: string
) => {
  const property = await prisma.property.findUnique({
    where: { id_business_id: { id: propertyId, business_id: businessId } },
  });
  if (!property)
    throw new ApiError("Property not found", StatusCodes.NOT_FOUND);
  if (property.image_public_id)
    await deleteFromCloudinary(property.image_public_id);
  await prisma.property.delete({
    where: { id_business_id: { id: propertyId, business_id: businessId } },
  });
  return apiResponse("Property deleted successfully");
};
