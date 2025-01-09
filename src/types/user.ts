import { IBase } from "./base";

export interface IUser extends IBase {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio: string;
  profile_pic: string;
  isPrivate: boolean;
}
