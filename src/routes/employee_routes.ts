import { Router } from "express";
import {
  addEmployee,
  editEmployee,
  getEmployees,
} from "../controllers/employee_controller.ts";

const employee_routes = Router();

//get all employees
employee_routes.get("/", getEmployees);

//add employee
employee_routes.post("/", addEmployee);

//edit employee
employee_routes.put("/", editEmployee);

export default employee_routes;
