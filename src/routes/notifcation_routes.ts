import { Router } from "express";
import {
  editNotification,
  getNotification,
} from "../controllers/notificationController.js";

const notification_routes = Router()
  .get("/", getNotification)
  .put("/", editNotification);

export default notification_routes;
