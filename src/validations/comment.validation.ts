import i18n from "../i18n/i18n";
import { validationMessageKey, Joi } from "utils";

export const commentValidations = {
  createCommentValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      postId: Joi.string().required(),
      parentId: Joi.string().optional(),
      content: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("createCommentValidation", error)));
    }
    return callback(true);
  },

  deleteCommentValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("deleteCommentValidation", error)));
    }
    return callback(true);
  },

  getCommentByPostIdValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(validationMessageKey("getCommentByPostIdValidation", error))
        );
    }
    return callback(true);
  },

  getCommentByCommentIdValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(
            validationMessageKey("getCommentByCommentIdValidation", error)
          )
        );
    }
    return callback(true);
  },

  getCommentsByUserIdValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      userId: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(
            validationMessageKey("getCommentByCommentIdValidation", error)
          )
        );
    }
    return callback(true);
  },
};
