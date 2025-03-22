import Joi from "joi";

//transaction validation

export const transactionShema = Joi.object({
  DISTRIBUTED_ITM_ID: Joi.number().min(1).required(),
  quantity: Joi.number().min(1).required(),
  remarks: Joi.number().required(),
  borrower_emp_id: Joi.number().allow(null).optional(),
  distributed_item_id: Joi.number().required(),
  owner_emp_id: Joi.number().required(),
  status: Joi.number().required(),
  DPT_ID: Joi.number().required(),
});
