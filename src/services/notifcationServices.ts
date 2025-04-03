import { Op } from "sequelize";
import { TransactionProps } from "../@types/types.js";
import NotificationModel from "../models/notificationModel.js";
import User from "../models/user.js";
import { CustomError } from "../utils/CustomError.js";
import setNotificationUser from "../utils/sendNotificationToUsers.js";
import { Request } from "express";
import Employee from "../models/employee.js";
import ItemModel from "../models/itemModel.js";
import { Server } from "socket.io";

const notificationServices = {
  //create notification
  async createTransactionNotificationService(data: Partial<TransactionProps>) {
    //find the admin of that department
    const adminDepartment = (await User.findOne({
      where: {
        DEPARTMENT_USER: data.DPT_ID,
        role: 1,
      },
    })) as any;

    if (!adminDepartment) throw new CustomError("Admin not found", 404);

    //create the notification
    const newNotification = await NotificationModel.create({
      TRANSACTION_ID: data.id,
      TRANSACTION: data.remarks,
      ITEM_ID: data.distributed_item_id,
      QUANTITY: data.quantity,
      REQUEST_STATUS: data.status,
      OWNER_ID: data.owner_emp_id,
      BORROWER_ID: data.borrower_emp_id,
      ADMIN_ID: adminDepartment.id,
    });

    return newNotification;
  },

  async getNotificationService({
    empId,
    limit,
  }: {
    empId: number;
    limit: number;
  }) {
    if (!empId) {
      throw new CustomError("Employee ID is invalid.", 400);
    }

    if (!limit || isNaN(limit)) {
      throw new CustomError("Limit is invalid.", 400);
    }

    //find admin emp id
    const admin = await User.findOne({
      where: {
        emp_id: empId,
        role: 1,
      },
    });

    return await NotificationModel.findAll({
      where: {
        [Op.or]: [
          { OWNER_ID: empId },
          { BORROWER_ID: empId },
          ...(admin ? [{ ADMIN_ID: admin.getDataValue("id") }] : []),
        ],
      },
      limit,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Employee, as: "ownerEmpDetails" },
        { model: Employee, as: "borrowerEmpDetails" },
        { model: ItemModel, as: "itemDetails" },
      ],
    });
  },

  //get notification count
  async getNotificationCountService({ empId }: { empId: number }) {
    if (!empId) {
      throw new CustomError("Employee ID is invalid.", 400);
    }

    //get admin emp id
    const admin = await User.findOne({
      where: {
        emp_id: empId,
        role: 1,
      },
    });

    return await NotificationModel.count({
      where: {
        [Op.or]: [
          { OWNER_ID: empId },
          { BORROWER_ID: empId },
          ...(admin ? [{ ADMIN_ID: admin.getDataValue("id") }] : []),
        ],
      },
    });
  },
};

export default notificationServices;
