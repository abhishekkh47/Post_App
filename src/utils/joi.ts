const Joi = require("joi");
const customJoi = Joi.defaults((schema: any) =>
  schema.options({
    allowUnknown: true,
  })
);
export default customJoi;
