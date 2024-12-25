import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "utils";

export const getHashedPassword = (password: string) => {
  return bcrypt.hashSync(password, SALT_ROUNDS);
};

export const verifyPassword = (password: string, hash: string) => {
  return bcrypt.compareSync(hash, password);
};
