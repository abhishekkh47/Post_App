import { ChatController } from "controllers";
import { GroupController } from "controllers";
import { Router } from "express";
import { AuthMiddleware } from "middleware";

const groupRoutes = Router();
groupRoutes.use(AuthMiddleware.Auth);

// Group Management
groupRoutes.get("/", async (req, res, next) => {
  try {
    await GroupController.getUserGroups(req, res, next);
  } catch (error) {
    next(error);
  }
});
groupRoutes.post("/create-group", async (req, res, next) => {
  try {
    await GroupController.createGroup(req, res, next);
  } catch (error) {
    next(error);
  }
});

groupRoutes.delete("/:groupId", async (req, res, next) => {
  try {
    await GroupController.deleteGroup(req, res, next);
  } catch (error) {
    next(error);
  }
});

groupRoutes.get("/:groupId", async (req, res, next) => {
  try {
    await GroupController.getGroupById(req, res, next);
  } catch (error) {
    next(error);
  }
});

groupRoutes.put("/:groupId", async (req, res, next) => {
  try {
    await GroupController.updateGroup(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Group Members
groupRoutes.post("/:groupId/members", async (req, res, next) => {
  try {
    await GroupController.addMembers(req, res, next);
  } catch (error) {
    next(error);
  }
});

groupRoutes.delete("/:groupId/members/:userId", async (req, res, next) => {
  try {
    await GroupController.removeMember(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Group Messages
groupRoutes.get("/:groupId/messages", async (req, res, next) => {
  try {
    await GroupController.getGroupMessages(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default groupRoutes;
