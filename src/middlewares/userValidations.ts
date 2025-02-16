import { body } from "express-validator";

const userValidationRules = [
  // Validate email
  body("email").isEmail().withMessage("Please provide a valid email."),
  // Validate username
  body("username").notEmpty().withMessage("Username is required."),
  // Validate password
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  // Validate employee ID
  body("emp_id").notEmpty().withMessage("Employee ID is required."),
  //validate role
  body("role").notEmpty().withMessage("User role is required."),
];
export default userValidationRules;
