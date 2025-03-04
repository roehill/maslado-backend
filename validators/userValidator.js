const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Hasła muszą być identyczne" }),
  organization: Joi.string().required(),
  name: Joi.string().required(),
});

module.exports = {
  validateRegisterUser: (data) => registerSchema.validate(data),
};
