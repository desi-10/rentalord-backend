import bcrypt from "bcryptjs";

export const hashed = async (password: string, salt: number) => {
  return await bcrypt.hash(password, salt);
};

export const compareHashed = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};
