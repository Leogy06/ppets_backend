import Joi from "joi";

const distributedItemDetails = Joi.object({
  unit_value: Joi.number().min(1).required(),
  ITEM_ID: Joi.number().min(1).required(),
  quantity: Joi.number().min(1).required(),
  accountable_emp: Joi.number().min(1).required(),
  added_by: Joi.number().min(1).required(),
  current_dpt_id: Joi.number().min(1).required(),
  DISTRIBUTED_BY: Joi.number().min(1).required(),
});

export default distributedItemDetails;
