import Joi from "joi";

const employeeSchema = Joi.object({
  FIRSTNAME: Joi.string().required(),
  LASTNAME: Joi.string().required(),
  MIDDLENAME: Joi.string().allow(null, "").optional(),
  SUFFIX: Joi.string().allow(null, "").optional(),
  ID_NUMBER: Joi.number().integer().min(10000).max(99999).required(),
  DEPARTMENT_ID: Joi.number().required().min(1),
  CREATED_BY: Joi.number().required().min(1),
  UPDATED_BY: Joi.number().required().min(1),
});

export default employeeSchema;
