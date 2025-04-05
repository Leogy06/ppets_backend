import { EmployeeProps } from "../@types/types.js";
import { logger } from "../logger/logger.js";
import NotificationModel from "../models/notificationModel.js";
import Employee from "../models/employee.js";
import employeeFullName from "./employeeFullName.js";
import { Request } from "express";
import { users } from "../sockets/socketManager.js";

const sentNotificationUser = async (
  empId: EmployeeProps["ID"],
  notification: NotificationModel,
  req: Request
) => {
  const employee = (await Employee.findByPk(empId)) as any;
  if (!employee) {
    logger.info(`User with ID ${empId} not found`);
    return;
  }

  const socketId = users.get(empId);

  if (socketId) {
    console.log("socketId", socketId);

    logger.info(`Sending notification to user ${employeeFullName(employee)}`);
    // Emit the notification to the user
    req.io.to(socketId).emit("newTransactionNotification", notification);
  }
};

export default sentNotificationUser;
