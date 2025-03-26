import { Router } from "express";
import {
  createEmployeeController,
  deleteEmployees,
  editEmployee,
  getEmployeeByIdController,
  getEmployeeCountController,
  getEmployees,
} from "../controllers/employeeController.js";
import joiValidation from "../middlewares/joiValidation.js";
import employeeSchema from "../validations/employeeValidation.js";

// /employees
const employeeRoutes = Router()
  .get("/", getEmployees)
  //createemployee
  .post("/", joiValidation(employeeSchema), createEmployeeController)
  .put("/", editEmployee)
  .delete("/", deleteEmployees)
  .get("/:employeeId", getEmployeeByIdController)
  .get("/api/count", getEmployeeCountController); //get employee count in a dpt
export default employeeRoutes;
