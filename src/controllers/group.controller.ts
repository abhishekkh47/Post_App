import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { ERR_MSGS } from "utils";
import { AuthService, GroupService } from "services";
import { IUser } from "types";

class GroupController extends BaseController {
  async createGroup(req: any, res: Response, next: NextFunction) {
    try {
      const { name, description, members = [] } = req.body;
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const group = await GroupService.createGroup(
        name,
        description,
        user._id,
        members
      );
      this.Ok(res, { group });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async getUserGroups(req: any, res: Response, next: NextFunction) {
    try {
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const groups = await GroupService.getUserGroups(user._id);
      if (!groups) {
        return this.BadRequest(res, "No Groups Found");
      }
      this.Ok(res, { groups });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async getGroupById(req: any, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const group = await GroupService.getGroupById(groupId);
      const isMember = group?.members.some(
        (member) => member.userId.toString() === user._id.toString()
      );
      if (!isMember) {
        return this.BadRequest(res, "You are not a member of this group");
      }
      this.Ok(res, { group });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async updateGroup(req: any, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const { name, description } = req.body;
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const group = await GroupService.getGroupById(groupId);
      const isAdmin = group?.members.some(
        (member) =>
          member.userId.toString() === user._id.toString() &&
          member.role === "admin"
      );
      if (!isAdmin) {
        return this.BadRequest(res, "Only group admins can update the group");
      }

      const updatedGroup = await GroupService.updateGroup(groupId, {
        name,
        description,
      });
      this.Ok(res, { updatedGroup });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async deleteGroup(req: any, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const group = await GroupService.getGroupById(groupId);
      const isAdmin = group?.members.some(
        (member) =>
          member.userId.toString() === user._id.toString() &&
          member.role === "admin"
      );
      if (!isAdmin) {
        return this.BadRequest(res, "Only group admins can delete this group");
      }
      await GroupService.deleteGroup(groupId);
      this.Ok(res, { message: "Group deleted successfully" });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async addMembers(req: any, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const { members } = req.body;
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const group = await GroupService.getGroupById(groupId);
      const isAdmin = group?.members.some(
        (member) =>
          member.userId.toString() === user._id.toString() &&
          member.role === "admin"
      );
      if (!isAdmin) {
        return this.BadRequest(
          res,
          "Only group admins can add members to this group"
        );
      }
      const updatedGroup = await GroupService.addMember(groupId, members);
      this.Ok(res, { updatedGroup });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async removeMember(req: any, res: Response, next: NextFunction) {
    try {
      const { groupId, userId: memberIdToRemove } = req.params;
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const group = await GroupService.getGroupById(groupId);
      const isAdmin = group?.members.some(
        (member) =>
          member.userId.toString() === user._id.toString() &&
          member.role === "admin"
      );
      const isSelf = req._id.toString() == memberIdToRemove.toString();
      if (!isAdmin && !isSelf) {
        return this.BadRequest(
          res,
          "You do not have permission to remove this member"
        );
      }
      const updatedGroup = await GroupService.removeMember(
        groupId,
        memberIdToRemove
      );
      this.Ok(res, { updatedGroup });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async getGroupMessages(req: any, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const user: IUser | null = await AuthService.findUserById(req._id);
      const { limit = 50, skip = 0 } = req.query;
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const group = await GroupService.getGroupById(groupId);
      const isMember = group?.members.some(
        (member) => member.userId.toString() === user._id.toString()
      );
      if (!isMember) {
        return this.BadRequest(res, "You are not a member of this group");
      }
      const messages = await GroupService.getGroupMessages(
        groupId,
        Number(limit),
        Number(skip)
      );
      this.Ok(res, { messages });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new GroupController();
