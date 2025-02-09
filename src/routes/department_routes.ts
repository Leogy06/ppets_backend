import { Router } from "express";
import { getDepartments } from "../controllers/department_controller.js";
import { protectRoute } from "../middlewares/auth.js";

const department_routes = Router();

department_routes.get("/", getDepartments);

export default department_routes;
