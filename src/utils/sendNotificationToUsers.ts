import { Server } from "socket.io";
import { EmployeeProps } from "../@types/types.js";
import { logger } from "../logger/logger.js";
import NotificationModel from "../models/notificationModel.js";
import Employee from "../models/employee.js";
import employeeFullName from "./employeeFullName.js";

const setNotificationUser = async (
  empId: EmployeeProps["ID"],
  transaction: NotificationModel,
  io: Server
) => {
  const employee = (await Employee.findByPk(empId)) as any;
  if (!employee) {
    logger.info(`User with ID ${empId} not found`);
    return;
  }

  logger.info(`Sending notification to user ${employeeFullName(employee)}`);
  // Emit the notification to the user
  io.to(employee.getDataValue("ID")).emit(
    "newTransactionNotification",
    transaction
  );
};

export default setNotificationUser;
