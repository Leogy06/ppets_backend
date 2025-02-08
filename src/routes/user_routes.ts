import { Router } from "express";
import { addUser, viewUsers } from "../controllers/user_controllers.js";
import userValidationRules from "../middlewares/userValidations.js";

const user_routes = Router();

//validate, add function
user_routes.post("/", userValidationRules, addUser).get("/", viewUsers);

export default user_routes;
