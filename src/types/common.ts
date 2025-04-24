import { EGender } from "./user";

export interface IRequestUser {
  _id: string;
}
export interface IUserSignup {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  profile_pic?: string;
  isPrivate?: boolean;
  contact: string;
  gender: EGender;
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

export interface ITokenResponse {
  token: string;
  refreshToken: string;
}

export interface IGroupConversation {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  lastMessage?: {
    _id: string;
    senderId: string;
    groupId: string;
    content: string;
    readBy: string[];
    createdAt: string;
    updatedAt: string;
  };
  unreadCount: number;
  type: string;
}
