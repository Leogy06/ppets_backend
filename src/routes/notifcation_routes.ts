import { Router } from "express";
import {
  createNotification,
  editNotification,
  getNotification,
} from "../controllers/notificationController.js";
import notificationValidationRules from "../middlewares/notificationValidations.js";

const notification_routes = Router()
  .post("/", notificationValidationRules, createNotification)
  .get("/", getNotification)
  .put("/", editNotification);

export default notification_routes;
