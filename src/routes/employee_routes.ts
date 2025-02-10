import { Router } from "express";
import {
  addEmployee,
  deleteEmployee,
  editEmployee,
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
  .delete("/delete", deleteEmployee);

export default employee_routes;
