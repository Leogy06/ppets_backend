import { Router } from "express";
import {
  getNoticationController,
  getNotificationCountController,
} from "../controllers/notificationController.js";
//end point - /notification
const notification_routes = Router()
  .get("/", getNoticationController)
  .get("/count", getNotificationCountController);

export default notification_routes;
