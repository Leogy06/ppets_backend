import { Router } from "express";
import {
  deleteEmployees,
  editEmployee,
  getEmployees,
} from "../controllers/employeeController.js";

const employeeRoutes = Router()
  .get("/", getEmployees)
  .put("/", editEmployee)
  .delete("/", deleteEmployees);

export default employeeRoutes;
