import { Router } from "express";
import {
  getNoticationController,
  getNotificationCountController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
} from "../controllers/notificationController.js";
//end point - /notification
const notification_routes = Router()
  .get("/", getNoticationController)
  .get("/count", getNotificationCountController)
  .get("/unread/count", getUnreadNotificationCountController)
  .post("/mark_read", markNotificationAsReadController);

export default notification_routes;
