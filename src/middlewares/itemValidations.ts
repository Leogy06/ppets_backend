import { body } from "express-validator";

const itemValidationRules = [
  body("ITEM_NAME").notEmpty().withMessage("Item name is missing. "),
  body("DESCRIPTION").notEmpty().withMessage("Description is missing. "),
  body("STOCK_QUANTITY").notEmpty().withMessage("Stock quantity is missing."),
  body("STOCK_QUANTITY")
    .isNumeric()
    .withMessage("Invalid stock quantity value. Must be a number"),
  body("SERIAL_NO").notEmpty().withMessage("Serial Number is missing."),
  body("PROP_NO").notEmpty().withMessage("Property Number is missing."),
  body("DEPARTMENT_ID").notEmpty().withMessage("Department ID is missing."),
  body("RECEIVED_AT").notEmpty().withMessage("Received date is missing."),
  body("PAR_NO").notEmpty().withMessage("PAR No date is missing."),
  body("MR_NO").notEmpty().withMessage("Mr no is missing."),
];

export default itemValidationRules;
