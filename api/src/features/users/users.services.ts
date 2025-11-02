import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import { prisma } from "../../utils/db.js";
import { TypeUser, TypeUserUpdate } from "./users.validator.js";
import { hashed } from "../../utils/hash.js";
import { getUserByIdUtil, getUserByPhoneNumber } from "./users.utils.js";

export const createUser = async (data: TypeUser) => {
  const existingUser = await getUserByPhoneNumber(data.phone_number);

  if (existingUser)
    throw new ApiError("User already exists", StatusCodes.CONFLICT);

  const hash = await hashed(data.password, 10);

  const user = await prisma.user.create({
    data: {
      phone_number: data.phone_number,
      password: hash,
      first_name: data.first_name,
      last_name: data.last_name,
      is_verified: true, // verified automatically since OTP matched
    },
  });

  return apiResponse("user created successfully", user);
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      first_name: true,
      phone_number: true,
      last_name: true,
      email: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });
  return apiResponse("Users fetched sucessfully", users);
};

// Fetch single user by ID
export const getUserById = async (userId: string) => {
  const existingUser = await getUserByIdUtil(userId);

  if (!existingUser)
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      properties: {
        select: {
          id: true,
          name: true,
          address: true,
          is_public: true,
          staff: {
            select: {
              _count: true,
              id: true,
              full_name: true,
            },
          },
          number_of_units: true,
          description: true,
        },
      },
    },
  });

  return apiResponse("Current user fetched successfully", user);
};

// Update user profile
export const updateUser = async (userId: string, data: TypeUserUpdate) => {
  const existingUser = await getUserByIdUtil(userId);

  if (!existingUser)
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      first_name: true,
      last_name: true,
      phone_number: true,
      email: true,
      updated_at: true,
    },
  });

  return apiResponse("User updated successfully", user);
};

// Delete user
export const deleteUser = async (userId: string) => {
  const existingUser = await getUserByIdUtil(userId);

  if (!existingUser)
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);

  await prisma.user.delete({
    where: { id: userId },
  });

  return apiResponse("User deleted successfully");
};
