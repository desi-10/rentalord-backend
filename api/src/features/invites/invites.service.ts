import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { prisma } from "../../utils/db.js";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import {
  TypeAcceptInvite,
  TypeCreateInvite,
  TypeUpdateInvite,
} from "./invites.validator.js";

export const createInviteService = async (
  inviterId: string,
  data: TypeCreateInvite
) => {
  const { property_id, phone_number, role } = data;

  // 1️⃣ Ensure property exists
  const property = await prisma.property.findUnique({
    where: { id: property_id },
  });

  if (!property) {
    throw new ApiError("Property not found", StatusCodes.NOT_FOUND);
  }

  // 2️⃣ Check inviter membership (must be landlord or manager)
  const membership = await prisma.propertyMembership.findFirst({
    where: {
      user_id: inviterId,
      property_id,
      is_active: true,
      // role: { in: ["landlord", "manager"] },
    },
  });

  console.log("membership", membership);

  return apiResponse("Membership fetched successfully", membership);

  if (!membership) {
    throw new ApiError(
      "You are not authorized to invite members to this property",
      StatusCodes.FORBIDDEN
    );
  }

  // 3️⃣ Generate invite token
  const token = crypto.randomBytes(32).toString("hex");

  // 4️⃣ Set expiry (e.g., 3 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3);

  // 5️⃣ Create the invite
  const invite = await prisma.propertyInvite.create({
    data: {
      property_id,
      phone_number,
      role,
      invited_by_id: inviterId,
      token,
      status: "pending",
      expires_at: expiresAt,
    },
  });

  // 6️⃣ (Optional) Send SMS or Email
  // sendSms(phone_number, `You've been invited to join a property as ${role}. Use token: ${token}`);

  return apiResponse("Invite sent successfully", { invite, token });
};

// GET all invites
export const getInvitesService = async () => {
  const invites = await prisma.propertyInvite.findMany({
    include: {
      property: { select: { id: true, name: true } },
      invited_by: { select: { id: true, first_name: true, last_name: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return apiResponse("Invites fetched sucessfully", invites);
};

// GET single invite
export const getInviteService = async (id: string) => {
  const invite = await prisma.propertyInvite.findUnique({
    where: { id },
    include: { property: true, invited_by: true },
  });

  if (!invite) throw new ApiError("Invite not found", StatusCodes.NOT_FOUND);

  return apiResponse("Invite fetched succesfully", invite);
};

// UPDATE invite (role/status)
export const updateInviteService = async (
  id: string,
  data: TypeUpdateInvite
) => {
  const existingProperty = await prisma.propertyInvite.findUnique({
    where: { id },
  });

  if (!existingProperty)
    throw new ApiError("Property not found", StatusCodes.NOT_FOUND);

  const invite = await prisma.propertyInvite.update({
    where: { id },
    data: {
      role: data.role || existingProperty.role,
      status: data.status || existingProperty.status,
    },
    include: { property: true, invited_by: true },
  });

  return apiResponse("Invite updated succesfully", invite);
};

// DELETE invite
export const deleteInviteService = async (id: string) => {
  const existingProperty = await prisma.propertyInvite.findUnique({
    where: { id },
  });

  if (!existingProperty)
    throw new ApiError("Property not found", StatusCodes.NOT_FOUND);

  await prisma.propertyInvite.delete({ where: { id } });
  return apiResponse("Invite deleted successfully", null);
};

// ACCEPT invite
export const acceptInviteService = async (data: TypeAcceptInvite) => {
  const { token, user_id } = data;

  const invite = await prisma.propertyInvite.findFirst({ where: { token } });

  if (!invite)
    throw new ApiError("Invalid invite token", StatusCodes.NOT_FOUND);

  if (invite.status !== "pending")
    throw new ApiError(
      "This invite has already been processed",
      StatusCodes.BAD_REQUEST
    );

  if (new Date(invite.expires_at) < new Date())
    throw new ApiError("This invite has expired", StatusCodes.BAD_REQUEST);

  // Add user to the property membership table (if applicable)
  await prisma.propertyMembership.create({
    data: {
      property_id: invite.property_id,
      user_id,
      role: invite.role,
      start_date: new Date(),
      is_active: true,
    },
  });

  // Mark invite as accepted
  await prisma.propertyInvite.update({
    where: { id: invite.id },
    data: { status: "accepted" },
  });

  return { message: "Invite accepted successfully" };
};
