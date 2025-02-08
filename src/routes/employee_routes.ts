import { Router } from "express";
import {
  addEmployee,
  deleteEmployee,
  editEmployee,
  getEmployees,
} from "../controllers/employee_controller.js";

const employee_routes = Router();

//get all employees
employee_routes.get("/", getEmployees);

//add employee
employee_routes.post("/", addEmployee);

//edit employee
employee_routes.put("/", editEmployee);

//delete employee
employee_routes.delete("/delete", deleteEmployee);

export default employee_routes;
