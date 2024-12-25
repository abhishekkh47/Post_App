import i18n from "../i18n/i18n";
import { validationMessageKey, Joi } from "utils";

export const authValidations = {
  userSignupValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
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
      return res.throw(
        400,
        res.__(validationMessageKey("userLoginValidation", error))
      );
    }
    return callback(true);
  },
};
