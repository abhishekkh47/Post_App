import i18n from "../i18n/i18n";
import { validationMessageKey, Joi } from "utils";

export const authValidations = {
  userSignupValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      contact: Joi.string()
        .required()
        .regex(/(?:\+91|91)?[6-9]\d{9}$/),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("userSignupValidation", error)));
    }
    return callback(true);
  },

  userLoginValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("userLoginValidation", error)));
    }
    return callback(true);
  },

  sendPasswordResetLinkValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(
            validationMessageKey("sendPasswordResetLinkValidation", error)
          )
        );
    }
    return callback(true);
  },

  resetPasswordUsingLinkValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(
            validationMessageKey("resetPasswordUsingLinkValidation", error)
          )
        );
    }
    return callback(true);
  },

  getUserProfileValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      userId: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("getUserProfileValidation", error)));
    }
    return callback(true);
  },

  searchUserProfileValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      search: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(validationMessageKey("searchUserProfileValidation", error))
        );
    }
    return callback(true);
  },

  sendNotificationValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      receiverId: Joi.string().required(),
      message: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(validationMessageKey("sendNotificationValidation", error))
        );
    }
    return callback(true);
  },

  readNotificationValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      notificationId: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(validationMessageKey("readNotificationValidation", error))
        );
    }
    return callback(true);
  },

  updateProfileValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().optional().allow(""),
      bio: Joi.string().optional().allow(""),
    });
    const { error } = schema.validate(req);

    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("updateProfileValidation", error)));
    }
    return callback(true);
  },

  updatePasswordFromAppSettingsValidation: (
    req: any,
    res: any,
    callback: any
  ) => {
    const schema = Joi.object({
      password: Joi.string().required(),
      newPassword: Joi.string().required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(
          i18n.__(
            validationMessageKey(
              "updatePasswordFromAppSettingsValidation",
              error
            )
          )
        );
    }
    return callback(true);
  },
};
