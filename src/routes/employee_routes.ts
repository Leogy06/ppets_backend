import { Router } from "express";
import { getEmployees } from "../controllers/employee_controller.ts";

const employee_routes = Router();

//get all employees
employee_routes.get("/", getEmployees);

export default employee_routes;
