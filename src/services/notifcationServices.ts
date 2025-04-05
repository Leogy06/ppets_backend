import { Op } from "sequelize";
import { TransactionProps, UserProps } from "../@types/types.js";
import NotificationModel from "../models/notificationModel.js";
import User from "../models/user.js";
import { CustomError } from "../utils/CustomError.js";
import Employee from "../models/employee.js";
import ItemModel from "../models/itemModel.js";
import sentNotificationUser from "../utils/sendNotificationToUsers.js";
import { Request } from "express";
import TransactionModel from "../models/transactionModel.js";

const notificationServices = {
  //create notification
  async createTransactionNotificationService(transactionId: number) {
    console.log("transactionId ", transactionId);

    //find the transaction
    const transaction = await TransactionModel.findByPk(transactionId);

    if (!transaction) throw new CustomError("Transaction not found", 404);

    //find the admin of that department
    const adminDepartment = await User.findOne({
      where: {
        DEPARTMENT_USER: transaction?.getDataValue("DPT_ID"),
        role: 1, //admin
      },
    });

    if (!adminDepartment) throw new CustomError("Admin not found", 404);

    //create the notification
    const newNotification = await NotificationModel.create({
      TRANSACTION_ID: transaction?.getDataValue("id").id,
      TRANSACTION: transaction?.getDataValue("remarks"),
      ITEM_ID: transaction?.getDataValue("distributed_item_id"),
      QUANTITY: transaction?.getDataValue("quantity"),
      REQUEST_STATUS: transaction?.getDataValue("status"),
      OWNER_ID: transaction?.getDataValue("owner_emp_id"),
      BORROWER_ID: transaction?.getDataValue("borrower_emp_id"),
      ADMIN_ID: adminDepartment.getDataValue("id"),
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
