import i18n from "../i18n/i18n";
import { validationMessageKey, Joi } from "utils";

export const chatValidations = {
  createGroupValidation: (req: any, res: any, callback: any) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      members: Joi.array().items(Joi.string()).required(),
      description: Joi.string().optional(),
      profile_pic: Joi.string().optional(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return res
        .status(400)
        .json(i18n.__(validationMessageKey("createGroupValidation", error)));
    }
    return callback(true);
  },
};
