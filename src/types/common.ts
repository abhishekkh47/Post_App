export interface IRequestUser {
  _id: string;
}
export interface IUserSignup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IUserAuthInfo {
  _id: string | undefined;
  issuedOn: number;
  expiredOn: number;
  email: string | undefined;
}
