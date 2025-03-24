import { Router } from "express";
import {
  deleteEmployees,
  editEmployee,
  getEmployeeByIdController,
  getEmployeeCountController,
  getEmployees,
} from "../controllers/employeeController.js";

// /employees
const employeeRoutes = Router()
  .get("/", getEmployees)
  .put("/", editEmployee)
  .delete("/", deleteEmployees)
  .get("/:employeeId", getEmployeeByIdController)
  .get("/api/count", getEmployeeCountController); //get employee count in a dpt
export default employeeRoutes;
