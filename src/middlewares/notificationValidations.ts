import { body } from "express-validator";

const notificationValidationRules = [
  body("message").notEmpty().withMessage("Message is required."),
  body("for_user").notEmpty().withMessage("For user is empty."),
];
export default notificationValidationRules;
