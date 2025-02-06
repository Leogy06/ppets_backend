import { Router } from "express";
import {
  addEmployee,
  getEmployees,
} from "../controllers/employee_controller.ts";

const employee_routes = Router();

//get all employees
employee_routes.get("/", getEmployees);

//add employee
employee_routes.post("/", addEmployee);

export default employee_routes;
