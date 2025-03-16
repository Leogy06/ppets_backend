import Express from "express";
import Notification from "../models/notificationModel.js";
import Employee from "../models/employee.js";
import { NotificationProps } from "../@types/types.js";
import BorrowingTransaction from "../models/transactionModel.js";

export const getNotification = async (
  request: Express.Request,
  response: Express.Response
): Promise<any> => {
  const empId = Number(request.query.empId);
  const limit = Number(request.query.limit);

  if (!empId || isNaN(empId)) {
    return response.status(400).json({ message: "Employee ID is invalid." });
  }
  try {
    const isEmployeeExist = await Employee.findByPk(empId);

    if (!isEmployeeExist) {
      return response.status(400).json({ message: "Employee does not exist." });
    }

    const notification = await Notification.findAll({
      where: { FOR_EMP: empId },
      include: [
        { model: BorrowingTransaction, as: "borrowingTransactionDetails" },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    });

    response.status(200).json(notification);
  } catch (error) {
    console.error("Unable to get notification. ", error);
    response
      .status(500)
      .json({ message: "Unable to get notification. ", error });
  }
};

//edit notification
//for now, changing read value
export const editNotification = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const notifId = Number(req.query.notifId);
  const { editEntries } = req.body;

  if (!notifId) {
    return res.status(400).json({ message: "Notif id is missing." });
  }

  try {
    const isNotifExist = (await Notification.findByPk(
      notifId
    )) as NotificationProps | null;

    if (!isNotifExist) {
      return res.status(404).json({ message: "Notification not found." });
    }

    isNotifExist.READ = editEntries.read || isNotifExist.READ;

    //save the edited values
    await isNotifExist.save();
  } catch (error) {
    console.error("Unable to edit notification. ", error);
    res.status(500).json({ message: "Unable to edit notification. ", error });
  }
};
