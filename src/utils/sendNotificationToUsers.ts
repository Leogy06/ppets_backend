import { Server } from "socket.io";
import { EmployeeProps } from "../@types/types.js";
import { logger } from "../logger/logger.js";
import NotificationModel from "../models/notificationModel.js";
import { users } from "../sockets/socketManager.js";

const setNotificationUser = async (
  empId: EmployeeProps["ID"],
  transaction: NotificationModel,
  io: Server
) => {
  const socketId = users.get(empId);

  if (socketId) {
    logger.info(`Sending notification to user ${empId}`);
    // Emit the notification to the user
    io.to(socketId).emit("newTransactionNotification", transaction);
  }
};

export default setNotificationUser;
