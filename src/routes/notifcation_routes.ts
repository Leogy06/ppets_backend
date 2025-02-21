import { Router } from "express";
import { createNotification } from "../controllers/notificationController.js";
import notificationValidationRules from "../middlewares/notificationValidations.js";

const notification_routes = Router().post(
  "/",
  notificationValidationRules,
  createNotification
);

export default notification_routes;
