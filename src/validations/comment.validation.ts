import i18n from "../i18n/i18n";
import { validationMessageKey, Joi } from "utils";
import { objectIdValidation } from "./common.validation";
import { ECommentType } from "types";

export const commentValidations = {
  createCommentValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      postId: objectIdValidation.required(),
      parentId: objectIdValidation.optional(),
      content: Joi.string().required(),
      type: Joi.string()
        .optional()
        .valid(...Object.values(ECommentType))
        .when("parentId", {
          is: Joi.exist(),
          then: Joi.valid(ECommentType.REPLY).required(),
          otherwise: Joi.valid(ECommentType.COMMENT).required(),
        }),
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
      commentId: objectIdValidation.required(),
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
      postId: objectIdValidation.required(),
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
      commentId: objectIdValidation.required(),
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
      userId: objectIdValidation.required(),
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

  likeCommentValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      commentId: objectIdValidation.required(),
      postId: objectIdValidation.required(),
      like: Joi.boolean().optional(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("likeCommentValidation", error)));
    }
    return callback(true);
  },
};
