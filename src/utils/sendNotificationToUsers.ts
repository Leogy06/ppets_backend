import { EmployeeProps, NotificationProps } from "../@types/types.js";
import { logger } from "../logger/logger.js";
import NotificationModel from "../models/notificationModel.js";
import { users } from "../sockets/socketManager.js";
import { Request } from "express";

const setNotificationUser = async (
  empId: EmployeeProps["ID"],
  transaction: NotificationModel,
  req: Request
) => {
  const socketId = users.get(empId);

  if (socketId) {
    logger.info(`Sending notification to user ${empId}`);
    // Emit the notification to the user
    req.io.to(socketId).emit("newTransactionNotification", transaction);
  }
};

export default setNotificationUser;
