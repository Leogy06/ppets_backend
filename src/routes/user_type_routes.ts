import { Router } from "express";
import { addUserType } from "../controllers/user_type.js";

const user_type_routes = Router().post("/", addUserType);

export default user_type_routes;
