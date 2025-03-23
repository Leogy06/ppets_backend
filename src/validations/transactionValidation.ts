import Joi from "joi";

//transaction validation

export const transactionShema = Joi.object({
  //required fields
  DISTRIBUTED_ITM_ID: Joi.number().min(1).required(),
  quantity: Joi.number().min(1).required(),
  remarks: Joi.number().required(),
  borrower_emp_id: Joi.number().allow(null).optional(),
  distributed_item_id: Joi.number().required(),
  owner_emp_id: Joi.number().required(),
  status: Joi.number().required(),
  DPT_ID: Joi.number().required(),

  id: Joi.number().allow(null).optional(), //for edit it is allow but optional
  borrowedItem: Joi.string().allow(null).optional(), //for edit again
  borrower: Joi.string().allow(null).optional(), //for edit again
  owner: Joi.string().allow(null).optional(), //for edit again
  APPROVED_BY: Joi.number().allow(null).optional(), //for edit again

  //additional optionals
  RECEIVED_BY: Joi.number().allow(null).optional(),
  TRANSACTION_DESCRIPTION: Joi.string().allow(null).optional(),
  createdAt: Joi.date().allow(null).optional(),
  updatedAt: Joi.date().allow(null).optional(),
  index: Joi.number().allow(null).optional(),
  distributedItemDetails: Joi.object().allow(null).optional(),
  borrowerEmpDetails: Joi.object().allow(null).optional(),
  ownerEmpDetails: Joi.object().allow(null).optional(),
  transactionDetails: Joi.object().allow(null).optional(),
  transactionRemarksDetails: Joi.object().allow(null).optional(),
  transactionDescriptionDetails: Joi.object().allow(null).optional(),
  remarksDescription: Joi.string().allow(null).optional(),
  transactionStatusDetails: Joi.object().allow(null).optional(),
  transactionDescription: Joi.string().allow(null).optional(),
});
