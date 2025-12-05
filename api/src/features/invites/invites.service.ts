import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import prisma from "../../utils/db.js";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import {
  TypeAcceptInvite,
  TypeCreateInvite,
  TypeUpdateInvite,
} from "./invites.validator.js";

// CREATE INVITE
export const createInviteService = async (
  inviterId: string,
  businessId: string,
  data: TypeCreateInvite
) => {
  const { property_id, phone_number, role } = data;

  // 1️⃣ Ensure property exists & belongs to the business
  const property = await prisma.property.findUnique({
    where: { id_business_id: { id: property_id, business_id: businessId } },
  });

  if (!property)
    throw new ApiError("Property not found", StatusCodes.NOT_FOUND);

  // 2️⃣ Ensure inviter is owner of business
  const business = await prisma.business.findFirst({
    where: { id: businessId, owner_id: inviterId, is_active: true },
  });

  if (!business)
    throw new ApiError(
      "You are not authorized to invite members to this property",
      StatusCodes.FORBIDDEN
    );

  // 3️⃣ Check existing invite
  const existingInvite = await prisma.propertyInvite.findUnique({
    where: {
      property_id_business_id_phone_number: {
        property_id,
        business_id: businessId,
        phone_number: phone_number || "",
      },
    },
  });

  if (existingInvite)
    throw new ApiError(
      "An invite already exists for this phone number",
      StatusCodes.BAD_REQUEST
    );

  // 4️⃣ Generate secure token + expiry
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  // 5️⃣ Create invite
  const invite = await prisma.propertyInvite.create({
    data: {
      property_id,
      business_id: businessId,
      phone_number,
      role,
      invited_by_id: inviterId,
      token,
      status: "pending",
      expires_at: expiresAt,
    },
  });

  return apiResponse("Invite sent successfully", { invite, token });
};

// GET all invites
export const getAllInvitesService = async (businessId: string) => {
  const invites = await prisma.propertyInvite.findMany({
    where: { business_id: businessId },
    include: {
      property: { select: { id: true, name: true } },
      invited_by: { select: { id: true, first_name: true, last_name: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return apiResponse("Invites fetched successfully", invites);
};

// GET one invite
export const getInviteService = async (businessId: string, id: string) => {
  const invite = await prisma.propertyInvite.findUnique({
    where: { business_id: businessId, id },
    include: { property: true, invited_by: true },
  });

  if (!invite) throw new ApiError("Invite not found", StatusCodes.NOT_FOUND);

  return apiResponse("Invite fetched successfully", invite);
};

// UPDATE invite
export const updateInviteService = async (
  businessId: string,
  id: string,
  data: TypeUpdateInvite
) => {
  const invite = await prisma.propertyInvite.findUnique({
    where: { business_id: businessId, id },
  });

  if (!invite) throw new ApiError("Invite not found", StatusCodes.NOT_FOUND);

  const updated = await prisma.propertyInvite.update({
    where: { business_id: businessId, id },
    data: {
      role: data.role ?? invite.role,
      status: data.status ?? invite.status,
    },
    include: { property: true, invited_by: true },
  });

  return apiResponse("Invite updated successfully", updated);
};

// DELETE invite
export const deleteInviteService = async (businessId: string, id: string) => {
  const invite = await prisma.propertyInvite.findUnique({
    where: { business_id: businessId, id },
  });

  if (!invite) throw new ApiError("Invite not found", StatusCodes.NOT_FOUND);

  await prisma.propertyInvite.delete({
    where: { business_id: businessId, id },
  });
  return apiResponse("Invite deleted successfully", null);
};

// ACCEPT invite
export const acceptInviteService = async (
  businessId: string,
  token: string,
  userId: string
) => {
  const invite = await prisma.propertyInvite.findFirst({
    where: { token, business_id: businessId },
  });

  if (!invite)
    throw new ApiError("Invalid invite token", StatusCodes.NOT_FOUND);

  if (invite.status !== "pending")
    throw new ApiError(
      "This invite has already been processed",
      StatusCodes.BAD_REQUEST
    );

  if (new Date(invite.expires_at) < new Date())
    throw new ApiError("This invite has expired", StatusCodes.BAD_REQUEST);

  // 1️⃣ Add user to membership list
  await prisma.propertyMembership.create({
    data: {
      property_id: invite.property_id,
      user_id: userId as string,
      role: invite.role,
      start_date: new Date(),
      is_active: true,
    },
  });

  // 2️⃣ Mark invite as accepted
  await prisma.propertyInvite.update({
    where: { business_id: businessId, id: invite.id },
    data: { status: "accepted" },
  });

  return apiResponse("Invite accepted successfully", null);
};
