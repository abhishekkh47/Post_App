import i18n from "../i18n/i18n";
import { POST_TYPE, validationMessageKey, Joi } from "utils";
// we can also use joi-objectid lib
import { objectIdValidation } from "validations";

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

  getGroupMessagesValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      groupId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(validationMessageKey("getGroupMessagesValidation", error))
        );
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
      description: Joi.string().required(),
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
};
