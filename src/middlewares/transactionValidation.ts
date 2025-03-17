//validate transaction
import { body } from "express-validator";

const transactionValidationRules = [
  body("distributed_item_id").notEmpty().withMessage("Item ID is required."),
  body("borrower_emp_id").notEmpty().withMessage("Borrower ID is required."),
  body("owner_emp_id").notEmpty().withMessage("Owner ID is required."),
  body("quantity").notEmpty().withMessage("Quantity is required."),
  body("DPT_ID").notEmpty().withMessage("Department is required."),
];

export default transactionValidationRules;
