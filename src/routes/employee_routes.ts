import { Router } from "express";
import {
  addEmployee,
  deleteEmployee,
  editEmployee,
  getEmployeeById,
  getEmployees,
} from "../controllers/employee_controller.js";

const employee_routes = Router()
  //get all employees
  .get("/", getEmployees)

  //add employee
  .post("/", addEmployee)
  //edit employee
  .put("/", editEmployee)

  //delete employee
  .delete("/delete", deleteEmployee)

  .get("/:empId", getEmployeeById);

export default employee_routes;
