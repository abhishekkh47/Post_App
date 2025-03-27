import i18n from "../i18n/i18n";
import { GROUP_CHAT_USER_ROLE, validationMessageKey, Joi } from "utils";
// we can also use joi-objectid lib
import { objectIdValidation } from "validations";

const { ADMIN, MEMBER } = GROUP_CHAT_USER_ROLE;
export const groupValidations = {
  createGroupValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      members: Joi.array().items(objectIdValidation).optional(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("createPostValidation", error)));
    }
    return callback(true);
  },

  deleteGroupValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      groupId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("deleteGroupValidation", error)));
    }
    return callback(true);
  },

  groupIdRequired: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      groupId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("groupIdRequired", error)));
    }
    return callback(true);
  },

  getGroupByIdValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      groupId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("getGroupByIdValidation", error)));
    }
    return callback(true);
  },

  updateGroupValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional().allow(""),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("updateGroupValidation", error)));
    }
    return callback(true);
  },

  removeMemberValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      groupId: objectIdValidation.required(),
      userId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("removeMemberValidation", error)));
    }
    return callback(true);
  },

  groupDetailsValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      groupId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("groupDetailsValidation", error)));
    }
    return callback(true);
  },

  updateUserRoleValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      groupId: objectIdValidation.required(),
      userId: objectIdValidation.required(),
    });
    const requestBody = Joi.object({
      role: Joi.string().valid(ADMIN, MEMBER).required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("updateUserRoleValidation", error)));
    }
    return callback(true);
  },

  inviteLinkRequired: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      groupId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("inviteLinkRequired", error)));
    }
    return callback(true);
  },
};
