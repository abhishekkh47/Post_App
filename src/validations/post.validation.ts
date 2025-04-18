import i18n from "../i18n/i18n";
import { POST_TYPE, validationMessageKey, Joi } from "utils";
// we can also use joi-objectid lib
import { objectIdValidation } from "validations";

export const postValidations = {
  createPostValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      post: Joi.string().allow("").optional(),
      type: Joi.number()
        .optional()
        .valid(...Object.values(POST_TYPE)),
      edited: Joi.boolean().optional(),
      // attachment: Joi.any().optional(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("createPostValidation", error)));
    }

    // ✅ At least post or one file is required
    const hasPost =
      typeof req.body.post === "string" && req.body.post.trim().length > 0;
    const hasAttachment = Array.isArray(req.files) && req.files.length > 0;

    if (!hasPost && !hasAttachment) {
      return res.status(400).json({
        message: "Either post content or at least one attachment is required.",
      });
    }
    return callback(true);
  },

  getPostsValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      userId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("getPostsValidation", error)));
    }
    return callback(true);
  },

  getPostDetailsUsingIdValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      postId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(
            validationMessageKey("getPostDetailsUsingIdValidation", error)
          )
        );
    }
    return callback(true);
  },

  deletePostByIdValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      postId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("deletePostByIdValidation", error)));
    }
    return callback(true);
  },

  editOrUpdatePostValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      postId: objectIdValidation.required(),
      post: Joi.string().required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(validationMessageKey("editOrUpdatePostValidation", error))
        );
    }
    return callback(true);
  },

  addReactionOnPost: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      postId: objectIdValidation.required(),
      reaction: Joi.string().optional(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(validationMessageKey("addReactionOnPostValidation", error))
        );
    }
    return callback(true);
  },

  removeReactionOnPost: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      postId: objectIdValidation.required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(validationMessageKey("removeReactionOnPostValidation", error))
        );
    }
    return callback(true);
  },
};
