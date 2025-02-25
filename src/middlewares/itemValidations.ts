import { body } from "express-validator";

const itemValidationRules = [
  body("item_id").notEmpty().withMessage("Item ID is missing. "),
  body("item_reciever").notEmpty().withMessage("Item reciever is missing. "),
  body("item_quantity").notEmpty().withMessage("Item quantity is missing. "),
];

export default itemValidationRules;
