import { Router } from "express";
import {
  addUser,
  checkUser,
  firstTimeLogin,
  login,
  logout,
  viewUsers,
} from "../controllers/user_controllers.js";
import userValidationRules from "../middlewares/userValidations.js";
import { protectRoute } from "../middlewares/auth.js";

const user_routes = Router()
  .post("/", userValidationRules, addUser)
  .get("/", protectRoute, viewUsers)
  .post("/auth/api/login", login)
  .post("/auth/api/logout", logout)

  //check user
  .get("/auth/api/checkuser", checkUser)

  //first time login
  .post("/auth/api/first_time_login", firstTimeLogin);

export default user_routes;
