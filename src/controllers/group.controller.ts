import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { GroupService } from "services";
import { groupValidations } from "validations/group.validation";
import { RequireActiveUser } from "middleware/requireActiveUser";
import { IGroups } from "types";
import { cloudinary } from "utils";
import { Readable } from "stream";

class GroupController extends BaseController {
  @RequireActiveUser()
  async createGroup(req: any, res: Response, next: NextFunction) {
    groupValidations.createGroupValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { name, description, members = [] } = req.body;
            const group = await GroupService.createGroup(
              name,
              description,
              req._id,
              members
            );
            this.Ok(res, { group });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async getUserGroups(req: any, res: Response, next: NextFunction) {
    try {
      const groups: IGroups[] = await GroupService.getUserGroups(req._id);
      if (!groups) {
        return this.BadRequest(res, "No Groups Found");
      }
      this.Ok(res, { groups });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  @RequireActiveUser()
  async getGroupById(req: any, res: Response, next: NextFunction) {
    groupValidations.getGroupByIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { groupId } = req.params;
            const group = await GroupService.getGroupById(groupId);
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            if (!this.ifMember(group, req._id)) {
              return this.BadRequest(res, "You are not a member of this group");
            }
            this.Ok(res, { group });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async updateGroup(req: any, res: Response, next: NextFunction) {
    groupValidations.updateGroupValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { groupId } = req.params;
            const { name, description } = req.body;

            const group = await GroupService.getGroupById(groupId);
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            if (!this.ifAdmin(group, req._id)) {
              return this.BadRequest(
                res,
                "Only group admins can update the group"
              );
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
      }
    );
  }

  @RequireActiveUser()
  async deleteGroup(req: any, res: Response, next: NextFunction) {
    groupValidations.deleteGroupValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { groupId } = req.params;

            const group = await GroupService.getGroupById(groupId);
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            if (!this.ifAdmin(group, req._id)) {
              return this.BadRequest(
                res,
                "Only group admins can delete this group"
              );
            }
            await GroupService.deleteGroup(groupId);
            this.Ok(res, { message: "Group deleted successfully" });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async addMembers(req: any, res: Response, next: NextFunction) {
    try {
      const {
        params: { groupId },
        body: { members },
      } = req;

      const group = await GroupService.getGroupById(groupId);
      if (!group) {
        return this.BadRequest(res, "Group do not exist");
      }
      if (!this.ifAdmin(group, req._id)) {
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

  @RequireActiveUser()
  async removeMember(req: any, res: Response, next: NextFunction) {
    groupValidations.removeMemberValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { groupId, userId: memberIdToRemove } = req.params;

            const group = await GroupService.getGroupById(groupId);
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            const isSelf = req._id.toString() == memberIdToRemove.toString();
            if (!this.ifAdmin(group, req._id) && !isSelf) {
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
      }
    );
  }

  @RequireActiveUser()
  async getGroupMessages(req: any, res: Response, next: NextFunction) {
    groupValidations.groupIdRequired(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { groupId } = req.params;
            const { limit = 50, skip = 0 } = req.query;

            const group = await GroupService.getGroupById(groupId);
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            if (!this.ifMember(group, req._id)) {
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
    );
  }

  @RequireActiveUser()
  async getGroupDetails(req: any, res: Response, next: NextFunction) {
    groupValidations.groupDetailsValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { groupId } = req.params;

            const group = await GroupService.getGroupById(groupId);
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            if (!this.ifMember(group, req._id)) {
              return this.BadRequest(res, "You are not a member of this group");
            }
            const groupDetails = await GroupService.getGroupDetails(groupId);
            this.Ok(res, { groupDetails });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async updateUserRole(req: any, res: Response, next: NextFunction) {
    groupValidations.updateUserRoleValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              params: { groupId, userId },
              body: { role },
            } = req;

            const group = await GroupService.getGroupById(groupId);
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            if (!this.ifAdmin(group, req._id)) {
              return this.BadRequest(res, "You are not an admin of this group");
            }
            const groupDetails = await GroupService.updateUserRole(
              groupId,
              userId,
              role
            );
            this.Ok(res, { groupDetails });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async updateGroupProfilePicture(req: any, res: Response, next: NextFunction) {
    try {
      const {
        params: { groupId },
        file,
      } = req;
      if (!file) {
        return this.BadRequest(res, "Upload a valid file");
      }

      const group = await GroupService.getGroupById(groupId);
      if (!group) {
        return this.BadRequest(res, "Group do not exist");
      }
      if (this.ifAdmin(group, req._id)) {
        return this.BadRequest(res, "You are not an admin of this group");
      }

      const result = cloudinary.v2.uploader.upload_stream(
        { resource_type: "auto" }, // Automatically detect file type
        async (error, result) => {
          if (error) {
            return next(error); // Pass error to the error handler
          }
          await GroupService.updateGroupProfilePicture(
            group._id,
            result?.secure_url || ""
          );
          // Send the Cloudinary image URL to the frontend
          this.Ok(res, { message: "success", filename: result?.secure_url });
        }
      );

      // Pipe the file into Cloudinary's upload stream
      const bufferStream = new Readable();
      bufferStream._read = () => {}; // Required to make the stream readable
      bufferStream.push(file?.buffer);
      bufferStream.push(null);
      bufferStream.pipe(result);
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  ifAdmin(group: IGroups, userId: string) {
    return group?.members.some(
      (member) =>
        member.userId.toString() === userId.toString() &&
        member.role === "admin"
    );
  }

  ifMember(group: IGroups, userId: string) {
    return group?.members.some(
      (member) => member.userId.toString() === userId.toString()
    );
  }

  @RequireActiveUser()
  async joinGroupUsingInviteLink(req: any, res: Response, next: NextFunction) {
    groupValidations.inviteLinkRequired(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              params: { inviteToken },
            } = req;

            const group: IGroups | null =
              await GroupService.getGroupDetailsUsingInviteLink(inviteToken);
            if (!group) {
              return this.BadRequest(res, "Invalid link");
            }
            if (this.ifMember(group, req._id)) {
              return this.BadRequest(
                res,
                "You are already a member of this group"
              );
            }

            const updatedGroup = await GroupService.addMember(group._id, [
              req._id,
            ]);
            if (!updatedGroup) {
              return this.BadRequest(res, "Group do not exist");
            }
            this.Ok(res, { message: "success", updatedGroup });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async getGroupDetailsUsingInviteLink(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    groupValidations.inviteLinkRequired(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              params: { inviteToken },
            } = req;

            const group: IGroups | null =
              await GroupService.getGroupDetailsUsingInviteLink(inviteToken);
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            if (this.ifMember(group, req._id)) {
              return this.BadRequest(
                res,
                "You are already a member of this group"
              );
            }

            this.Ok(res, { message: "success", group });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async resetGroupInviteLink(req: any, res: Response, next: NextFunction) {
    groupValidations.groupIdRequired(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              params: { groupId },
            } = req;

            const group: IGroups | null = await GroupService.getGroupById(
              groupId
            );
            if (!group) {
              return this.BadRequest(res, "Group do not exist");
            }
            const updatedGroup: IGroups | null =
              await GroupService.resetGroupInviteLink(groupId);

            this.Ok(res, { message: "success", group: updatedGroup });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }
}

export default new GroupController();
