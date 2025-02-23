import { body } from "express-validator";

const notificationValidationRules = [
  body("message").notEmpty().withMessage("Message is required."),
  body("for_emp").notEmpty().withMessage("For emp is empty."),
];
export default notificationValidationRules;
