import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { MessageService } from "services";
import { verifyToken, WS_EVENTS } from "utils";

const setupWebSocket = (httpServer: HttpServer) => {
  const {
    CHAT: {
      LISTENER: { MARK_READ, NEW_MESSAGE, TYPING },
      EMITTER: { PRIVATE_MSG, MESSAGE_SENT, USER_TYPING, MESSAGE_MARKED_READ },
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

  io.on("connection", (socket) => {
    const userId = socket.data.user._id;
    userSockets.set(userId, socket.id);

    socket.on(PRIVATE_MSG, async (data) => {
      try {
        const message = await MessageService.sendMessage(
          userId,
          data.receiverId,
          data.content,
          data.attachments
        );

        const receiverSocketId = userSockets.get(data.receiverId);
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

    socket.on("disconnect", () => {
      userSockets.delete(userId);
    });
  });

  return io;
};

export default setupWebSocket;
