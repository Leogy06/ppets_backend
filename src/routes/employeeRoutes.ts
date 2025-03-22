import { Router } from "express";
import { getEmployees } from "../controllers/employeeController.js";

const employeeRoutes = Router().get("/", getEmployees);

export default employeeRoutes;
