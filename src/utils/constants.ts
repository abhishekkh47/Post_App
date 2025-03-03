export const SALT_ROUNDS = 10;
export const POST_TYPE = {
  TEXT: 1,
  IMAGE: 2,
};

export const ERR_MSGS = {
  USER_EXISTS: "User already exists",
  PROVIDE_ALL_DETAILS: "Please provide all details",
  USER_NOT_FOUND: "User do not exists",
  EMAIL_NOT_FOUND: "Email do not exists",
  INVALID_REQUEST: "Invalid Request",
  PASSWORD_DONT_MATCH: "Password do not match",
  PASSWORD_UPDATED: "Password Updated",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",
  INVALID_CREDENTIALS: "Invalid credentials",
};

export const SUCCESS_MSGS = {
  SUCCESS: "success",
  LINK_SENT: "Link sent",
  POST_CREATED: "Post created successfully",
  POST_DELETED: "Post deleted successfully",
  COMMENT_DELETED: "Comment deleted",
  NOTIFICATION_SENT: "Notification Sent",
};

export const NOTIFICATION_MSGS = {
  FRIEND_REQUEST: "sent you a friend request",
  FRIEND_REQUEST_ACCEPTED: "accepted your friend request",
  FOLLOW: "started following you",
  LIKE: "liked your post",
  COMMENT: "commented on your post",
};

export const WS_EVENTS = {
  CHAT: {
    LISTENER: {
      NEW_MESSAGE: "new_message",
      MESSAGE_READ: "message_read", // not used
      TYPING: "typing",
      MARK_READ: "mark_read",
    },
    EMITTER: {
      MESSAGE_MARKED_READ: "message_marked_read",
      USER_TYPING: "user_typing",
      PRIVATE_MSG: "private_message",
      MESSAGE_SENT: "message_sent",
    },
  },
};
