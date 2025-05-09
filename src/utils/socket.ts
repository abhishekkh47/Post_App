import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  GroupService,
  MessageService,
  PostService,
  WebPushService,
} from "services";
import { verifyToken, WS_EVENTS } from "utils";
import { NotificationTable, UserTable, GroupTable } from "models";
import { EnotificationType } from "types";

const setupWebSocket = (httpServer: HttpServer) => {
  const {
    CHAT: {
      LISTENER: { MARK_READ, NEW_MESSAGE, TYPING, GET_ACTIVE_USERS },
      EMITTER: {
        PRIVATE_MSG,
        MESSAGE_SENT,
        USER_TYPING,
        MESSAGE_MARKED_READ,
        // ACIVE_USERS,
      },
    },
    GROUP: {
      LISTENER: {
        JOIN_GROUP,
        LEAVE_GROUP,
        GROUP_MSG,
        GROUP_TYPING,
        GROUP_MARK_READ,
      },
      EMITTER: {
        GROUP_JOINED,
        GROUP_LEFT,
        GROUP_MESSAGE_SENT,
        GROUP_NEW_MESSAGE,
        GROUP_USER_TYPING,
        GROUP_MESSAGE_MARKED_READ,
      },
    },
    NOTIFICATIONS: {
      LISTENER: { LIKE_A_POST, COMMENT_ON_POST, LIKE_A_COMMENT, REPLY_COMMENT },
      EMITTER: { POST_LIKED, POST_COMMENT, COMMENT_LIKED, COMMENT_REPLY },
    },
  } = WS_EVENTS;

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    path: "/socket.io",
  });

  const userSockets = new Map<string, string>();
  const socketRooms = new Map<string, Set<string>>();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = verifyToken(token);
      if (!user) {
        return next(new Error("Authentication error"));
      }
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.user._id;
    const userDetails = await UserTable.findOne({ _id: userId });
    userSockets.set(userId, socket.id);
    socketRooms.set(socket.id, new Set());

    // Auto-join user to their groups
    try {
      const userGroups = await GroupService.getUserGroups(userId);
      userGroups.forEach((group) => {
        const roomId = `group:${group._id}`;
        socket.join(roomId);
        socketRooms.get(socket.id)?.add(roomId);
      });
    } catch (error) {
      console.error("Error joining user to groups:", error);
    }

    socket.on(PRIVATE_MSG, async (data) => {
      try {
        const { receiverId, content = "", attachments = [] } = data;
        const message = await MessageService.sendMessage(
          userId,
          receiverId,
          content,
          attachments
        );

        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          // Create a preview (first 50 characters)
          const messagePreview =
            content.length > 50 ? `${content.substring(0, 47)}...` : content;
          const senderName = userDetails
            ? userDetails.firstName || "Someone"
            : "Someone";
          await WebPushService.sendMessageNotification(
            userId,
            receiverId,
            senderName,
            messagePreview
          );
        }

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(NEW_MESSAGE, message);
        }

        socket.emit(MESSAGE_SENT, message);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on(TYPING, (data) => {
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit(USER_TYPING, { userId });
      }
    });

    /** --------
     * // Assuming you're using socket.io in the backend
     * socket.on("send_message", (message) => {
     * // Broadcast the message to the recipient user
     * socket.to(message.receiverId).emit("message", message);
     * });
     --------- */

    socket.on(MARK_READ, async (data) => {
      try {
        // await MessageService.markMessagesAsRead(data.senderId, userId);
        const senderSocketId = userSockets.get(data.receiverId);
        if (senderSocketId) {
          io.to(senderSocketId).emit(MESSAGE_MARKED_READ, { userId });
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    socket.on(JOIN_GROUP, async (data) => {
      try {
        const { groupId } = data;
        const roomId = `group:${groupId}`;

        // check if the user is the member of the group
        const group = await GroupService.getGroupById(groupId);
        const isMember = group?.members?.some(
          (member) => member.userId.toString === userId
        );

        if (!isMember) {
          await GroupService.addMember(groupId, userId);
        }

        socket.join(roomId);
        socketRooms.get(socket.id)?.add(roomId);

        socket.emit(GROUP_JOINED, { groupId, success: true });
        socket.to(roomId).emit("user_joined_group", {
          groupId,
          userId,
          userName: socket.data.user.name || socket.data.user.email,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to join group" });
      }
    });

    socket.on(LEAVE_GROUP, async (data) => {
      try {
        const { groupId } = data;
        const roomId = `group:${groupId}`;

        await GroupService.removeMember(groupId, userId);

        socket.leave(roomId);
        socketRooms.get(socket.id)?.delete(roomId);

        socket.emit(GROUP_LEFT, { groupId, success: true });
        socket.to(roomId).emit("user_left_group", {
          groupId,
          userId,
          username: socket.data.user.name || socket.data.user.email,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to leave group" });
      }
    });

    socket.on(GROUP_MSG, async (data) => {
      try {
        const { groupId, content, attachments } = data;
        const roomId = `group:${groupId}`;

        if (groupId) {
          // 1. Get all userIds in the group (excluding sender)
          const groupDetails = await GroupTable.findOne({ _id: groupId }); // returns array of userIds
          const recipients = groupDetails?.members?.filter(
            (user) => user.userId !== userId
          );
          // Create a preview (first 50 characters)
          const messagePreview =
            content.length > 50 ? `${content.substring(0, 47)}...` : content;
          const senderName = userDetails
            ? userDetails.firstName || "Someone"
            : "Someone";
          for (let recipient of recipients!) {
            await WebPushService.sendMessageNotification(
              userId,
              recipient.userId.toString(),
              senderName,
              messagePreview
            );
          }
        }

        // Save message to database
        const message = await GroupService.sendGroupMessage(
          groupId,
          userId,
          content,
          attachments
        );

        // Broadcast to all group members
        io.to(roomId).emit(GROUP_NEW_MESSAGE, message);

        // Confirm to sender
        socket.emit(GROUP_MESSAGE_SENT, message);
      } catch (error) {
        socket.emit("error", { message: "Failed to send group message" });
      }
    });

    socket.on(GROUP_TYPING, (data) => {
      const { groupId } = data;
      const roomId = `group:${groupId}`;

      socket.to(roomId).emit(GROUP_USER_TYPING, {
        groupId,
        userId,
        username: socket.data.user.name || socket.data.user.email,
      });
    });

    socket.on(GROUP_MARK_READ, async (data) => {
      try {
        const { groupId, messageId } = data;
        const roomId = `group:${groupId}`;

        await GroupService.markGroupMessageAsRead(messageId, userId);

        // Notify group that the user has read the message
        socket.to(roomId).emit(GROUP_MESSAGE_MARKED_READ, {
          groupId,
          messageId,
          userId,
          readAt: new Date(),
        });
      } catch (error) {
        socket.emit("error", {
          message: "Failed to mark group message as read",
        });
      }
    });

    // Handle Post Engagement
    socket.on(LIKE_A_POST, async (data) => {
      try {
        const { receiverId, postId } = data;
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          try {
            // Get sender's name
            const senderName = userDetails
              ? userDetails.firstName || "Someone"
              : "Someone";

            // Send push notification
            await WebPushService.sendLikeNotification(
              userId,
              receiverId,
              senderName,
              postId
            );
          } catch (error) {
            console.error("Error sending like notification:", error);
          }
        }

        await Promise.all([
          PostService.likePost(userId, data.postId),
          userId !== receiverId
            ? NotificationTable.create({
                senderId: userId,
                receiverId: receiverId,
                message: "liked your post",
                isRead: false,
                contentId: postId,
                type: EnotificationType.LIKE,
              })
            : Promise.resolve(),
        ]);

        // Notify group that the user has read the message
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit(POST_LIKED, { userId });
        }
      } catch (error) {
        socket.emit("error", {
          message: "Failed to like the post",
        });
      }
    });

    socket.on(COMMENT_ON_POST, async (data) => {
      try {
        const { receiverId, postId } = data;
        const receiverSocketId = userSockets.get(data.receiverId);

        if (receiverSocketId) {
          try {
            const senderName = userDetails
              ? userDetails.firstName || "Someone"
              : "Someone";

            // Send push notification
            await WebPushService.sendCommentNotification(
              userId,
              receiverId,
              senderName,
              postId
            );
          } catch (error) {
            console.error("Error sending like notification:", error);
          }
        }

        await Promise.all([
          PostService.likePost(userId, data.postId),
          userId !== data.receiverId
            ? NotificationTable.create({
                senderId: userId,
                receiverId: data.receiverId,
                message: "commented on your post",
                isRead: false,
                contentId: data.postId,
                type: EnotificationType.COMMENT,
              })
            : Promise.resolve(),
        ]);

        // Notify group that the user has read the message
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit(POST_COMMENT, { userId });
        }
      } catch (error) {
        socket.emit("error", {
          message: "Failed to comment the post",
        });
      }
    });

    socket.on(REPLY_COMMENT, async (data) => {
      try {
        const receiverSocketId = userSockets.get(data.receiverId);

        await Promise.all([
          PostService.likePost(userId, data.postId),
          userId !== data.receiverId
            ? NotificationTable.create({
                senderId: userId,
                receiverId: data.receiverId,
                message: "replied to your comment",
                isRead: false,
              })
            : Promise.resolve(),
        ]);

        // Notify group that the user has read the message
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit(COMMENT_REPLY, { userId });
        }
      } catch (error) {
        socket.emit("error", {
          message: "Failed to comment on the post",
        });
      }
    });

    // Get all active users
    socket.on(GET_ACTIVE_USERS, async (replyFn) => {
      let activeUsers = [...userSockets.keys()];
      activeUsers = activeUsers.filter((id) => id !== userId);
      const userDetails = await UserTable.find(
        { _id: { $in: activeUsers } },
        { firstName: 1, lastName: 1, email: 1, profile_pic: 1 }
      );
      replyFn(userDetails);
    });

    socket.on("disconnect", () => {
      userSockets.delete(userId);
      // Clean up room memberships
      const rooms = socketRooms.get(socket.id) || new Set();
      rooms.forEach((room) => {
        if (room.startsWith("group:")) {
          const groupId = room.replace("group:", "");
          socket.to(room).emit("user_left_group", {
            groupId,
            userId,
            username: socket.data.user.name || socket.data.user.email,
            reason: "disconnected",
          });
        }
      });

      socketRooms.delete(socket.id);
    });
  });

  return io;
};

export default setupWebSocket;
