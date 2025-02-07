import i18n from "../i18n/i18n";
import { validationMessageKey, Joi } from "utils";

export const followValidations = {
  followValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      followerId: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("followValidation", error)));
    }
    return callback(true);
  },

  unfollowValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      followerId: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("unfollowValidation", error)));
    }
    return callback(true);
  },

  getFollowersValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      userId: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("getFollowersValidation", error)));
    }
    return callback(true);
  },
};
