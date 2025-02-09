import { Router } from "express";
import {
  addUser,
  checkUser,
  login,
  logout,
  viewUsers,
} from "../controllers/user_controllers.js";
import userValidationRules from "../middlewares/userValidations.js";
import { protectRoute } from "../middlewares/auth.js";

const user_routes = Router();

//validate, add function
user_routes
  .post("/", userValidationRules, protectRoute, addUser)
  .get("/", protectRoute, viewUsers)
  .post("/auth/api/login", login)
  .post("/auth/api/logout", logout)

  //check user
  .get("/auth/api/checkuser", checkUser);

export default user_routes;
