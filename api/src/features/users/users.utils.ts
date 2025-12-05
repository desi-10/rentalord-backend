import prisma from "../../utils/db.js";

export async function getUserByPhoneNumber(phoneNumber: string) {
  const user = prisma.user.findUnique({ where: { phone_number: phoneNumber } });
  return user;
}

export async function getUserByIdUtil(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}
