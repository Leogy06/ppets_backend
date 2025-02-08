import { Router } from "express";
import { addUser } from "../controllers/user_controllers.js";
import userValidationRules from "../middlewares/userValidations.js";

const user_routes = Router();

//validate, add function
user_routes.post("/", userValidationRules, addUser);

export default user_routes;
