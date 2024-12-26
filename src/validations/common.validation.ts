import i18n from "../i18n/i18n";
import Joi from "joi";
import mongoose from "mongoose";

export const objectIdValidation = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      const localizedMessage = i18n.__("Invalid MongoDB ObjectId");

      // Return a custom error message object for Joi
      return helpers.message({
        "any.invalid": localizedMessage, // 'any.invalid' is the default error key for invalid types
      });
    }
    return value;
  })
  .message("Invalid Request");
