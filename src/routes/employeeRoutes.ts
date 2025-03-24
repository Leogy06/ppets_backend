import { Router } from "express";
import {
  deleteEmployees,
  editEmployee,
  getEmployeeByIdController,
  getEmployees,
} from "../controllers/employeeController.js";

const employeeRoutes = Router()
  .get("/", getEmployees)
  .put("/", editEmployee)
  .delete("/", deleteEmployees)
  .get("/:employeeId", getEmployeeByIdController);

export default employeeRoutes;
