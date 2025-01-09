export interface IRequestUser {
  _id: string;
}
export interface IUserSignup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  profile_pic?: string;
  isPrivate?: boolean;
}

export interface IUserAuthInfo {
  _id: string | undefined;
  issuedOn: number;
  expiredOn: number;
  email: string | undefined;
}

export interface IFollowUser {
  followerId: string;
  followeeId: string;
}
