import i18n from "../i18n/i18n";
import { POST_TYPE, validationMessageKey, Joi } from "utils";

export const postValidations = {
  createPostValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      post: Joi.string().required(),
      type: Joi.number()
        .optional()
        .valid(...Object.values(POST_TYPE)),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("createPostValidation", error)));
    }
    return callback(true);
  },

  getPostsValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({});
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
      id: Joi.string().required(),
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
      id: Joi.string().required(),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("deletePostByIdValidation", error)));
    }
    return callback(true);
  },
};
