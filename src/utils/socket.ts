import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { MessageService } from "services";
import { verifyToken } from "utils";

const setupWebSocket = (httpServer: HttpServer) => {
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
    console.log("A user connected");
    const userId = socket.data.user._id;
    userSockets.set(userId, socket.id);

    socket.on("private_message", async (data) => {
      try {
        const message = await MessageService.sendMessage(
          userId,
          data.receiverId,
          data.content,
          data.attachments
        );

        const receiverSocketId = userSockets.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message", message);
        }

        socket.emit("message_sent", message);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", (data) => {
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { userId });
      }
    });

    socket.on("mark_read", async (data) => {
      try {
        await MessageService.markMessagesAsRead(data.senderId, userId);
        const senderSocketId = userSockets.get(data.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_read", { userId });
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
      userSockets.delete(userId);
    });
  });

  return io;
};

export default setupWebSocket;
