import { IBase } from "./base";

export interface IUser extends IBase {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio: string;
  profile_pic: string;
  isPrivate: boolean;
  posts: number;
  followers: number;
  following: number;
  gender: EGender;
  contact: string;
  resetPasswordToken: string;
}

export enum EGender {
  FEMALE = "F",
  MALE = "M",
}
