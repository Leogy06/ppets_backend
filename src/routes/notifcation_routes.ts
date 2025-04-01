import { Router } from "express";
import { getNoticationController } from "../controllers/notificationController.js";
//end point - /notification
const notification_routes = Router().get("/", getNoticationController);

export default notification_routes;
