import Jwt from "jsonwebtoken";
import { NetworkError } from "middleware";
import { IUserAuthInfo } from "types";
import Config from "../config";

export const getJwtToken = (body: IUserAuthInfo, expiryTime: number = 0) => {
  return Jwt.sign(body, Config.JWT_KEY, {
    expiresIn: expiryTime ? expiryTime : 36000,
  });
};

export const verifyToken = (token: string) => {
  try {
    return Jwt.verify(token, Config.JWT_KEY) as any;
  } catch (error) {
    throw new NetworkError("Invalid Token", 400);
  }
};

export const getRefereshToken = (body: IUserAuthInfo) => {
  return Jwt.sign(body, Config.JWT_KEY, {
    expiresIn: "365d",
  });
};

export const decodeJwtToken = (body: any) => {
  return Jwt.decode(body);
};
