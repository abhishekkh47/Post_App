import { Router } from "express";
import defaultRoutes from "./default";
import authRoutes from "./auth";
import userRoutes from "./user";
import postRoutes from "./post";
import commentRoutes from "./comment";
import followRoutes from "./follow";
import chatRoutes from "./chat";
import notificationRoutes from "./notification";
import groupRoutes from "./groupChat";
import commonRoutes from "./common";

const router = Router();
router.use("/", defaultRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/post", postRoutes);
router.use("/comment", commentRoutes);
router.use("/follow", followRoutes);
router.use("/chat", chatRoutes);
router.use("/notification", notificationRoutes);
router.use("/group", groupRoutes);
router.use("/common", commonRoutes);

export default router;
