import { body } from "express-validator";

const loginValidation = [
  // Validate email
  // Validate username
  body("username").notEmpty().withMessage("Username is required."),
  // Validate password
  body("password").notEmpty().withMessage("Password is required"),
];

export default loginValidation;
