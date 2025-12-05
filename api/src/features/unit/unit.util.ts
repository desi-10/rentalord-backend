import prisma from "../../utils/db.js";

export const findUnitById = async (id: string) => {
  const existingUnit = await prisma.unit.findUnique({
    where: { id },
  });

  return existingUnit;
};
