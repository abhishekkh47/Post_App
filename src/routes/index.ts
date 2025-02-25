import { Router } from "express";
import defaultRoutes from "./default";
import authRoutes from "./auth";
import userRoutes from "./user";
import postRoutes from "./post";
import commentRoutes from "./comment";
import followRoutes from "./follow";
import chatRoutes from "./chat";

const router = Router();
router.use("/", defaultRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/post", postRoutes);
router.use("/comment", commentRoutes);
router.use("/follow", followRoutes);
router.use("/chat", chatRoutes);

export default router;
