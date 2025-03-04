import express from "express";
import BorrowingTransaction from "../models/transactionModel.js";
import Item from "../models/distributedItemModel.js";
import Employee from "../models/employee.js";
import {
  BorrowingTransactionProps,
  ItemModelProps,
  ItemProps,
  NotificationProps,
} from "../@types/types.js";
import Notification from "../models/notificationModel.js";
import Department from "../models/department.js";
import BorrowingStatus from "../models/transactionStatusModel.js";
import ItemModel from "../models/itemModel.js";
import User from "../models/user.js";
import { users } from "../sockets/socketManager.js";

//get borrow transaciton by owner
export const getBorrowTransactions = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { owner } = req.query;
  try {
    if (!owner) {
      return res.status(400).json({ message: "Owner id is required." });
    }

    const borrows = await BorrowingTransaction.findAll({
      where: { owner },

      order: [["createdAt", "DESC"]],
      include: [
        { model: ItemModel, as: "itemDetails" },
        { model: BorrowingStatus, as: "statusDetails" },
      ],
    });

    res.status(200).json(borrows);
  } catch (error) {
    console.error("Unable to get borrows: ", error);
    res.status(500).json({ message: "Unable to get borrows. ", error });
  }
};

//borrower get transaction by borrower
export const getBorrowTransactionByEmployee = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const { empId } = req.query;

  if (!empId || isNaN(Number(empId))) {
    console.log({ empId });
    return res
      .status(400)
      .json({ message: "A valid employee ID is required." });
  }

  const empIdNo = Number(empId);

  try {
    const foundEmployee = await Employee.findByPk(empIdNo);

    if (!foundEmployee) {
      return res.status(404).json({ message: "Employee does not exist." });
    }

    const borrowTransactions = await BorrowingTransaction.findAll({
      where: { borrower: empIdNo },
      include: [
        {
          model: Employee,
          as: "ownerEmp",
        },
      ],
    });

    res.status(200).json(borrowTransactions);
  } catch (error) {
    console.error("Unable to get borrow transaction by employee. ", error);
    res.status(500).json({
      message: "Unable to get borrow transaction by employee.",
      error,
    });
  }
};

//edit
//could use to update status
export const editBorrowTransaction = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const borrowId = Number(req.query.borrowId);
  const { status } = req.body;

  if (!borrowId) {
    return res.status(400).json({ message: "Borrow id is required." });
  }

  if (!status) {
    return res.status(400).json({ message: "Status is missing" });
  }

  try {
    const borrowTransaction = (await BorrowingTransaction.findByPk(
      borrowId
    )) as BorrowingTransactionProps;

    if (!borrowTransaction) {
      return res
        .status(404)
        .json({ message: "Borrow transaction does not exist. " });
    }

    //find item
    const isItemExist = (await Item.findByPk(
      borrowTransaction.borrowedItem
    )) as ItemProps;

    if (!isItemExist) {
      return res.status(404).json({ message: "Item not found." });
    }

    //if status is 1 (approved), deduct quantity.
    if (status === 1) {
      if (isItemExist.quantity >= borrowTransaction.quantity) {
        isItemExist.quantity -= borrowTransaction.quantity;
        await isItemExist.save();
      } else {
        return res.status(400).json({ message: "Not enough stock available." });
      }
    }

    //if status is 5 (returned), restore the borrowed item quantity
    if (status === 5) {
      //ensure if the transaction is approved.
      if (borrowTransaction.status === 1) {
        isItemExist.quantity += borrowTransaction.quantity;
        await isItemExist.save();
      } else {
        return res
          .status(400)
          .json({ message: "Cannot return an unapproved transaction." });
      }
    }

    borrowTransaction.status = status;

    borrowTransaction.updatedAt = new Date();

    const result = await borrowTransaction.save();

    res
      .status(200)
      .json({ message: "Transaction update successfully.", result });
  } catch (error) {
    console.error("Unable to edit transaction. ", error);
    res.status(500).json({ message: "Unable to edit transaction. ", error });
  }
};

//get transaction by dpt
export const getBorrowingTransactionByDpt = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { departmentId } = req.query;

  if (!departmentId) {
    return res.status(400).json({ message: "Department ID is missing. " });
  }
  try {
    const transactions = await BorrowingTransaction.findAll({
      where: { DPT_ID: departmentId },
      include: [
        { model: Employee, as: "borrowerEmp" },
        { model: ItemModel, as: "itemDetails" },
        { model: Employee, as: "ownerEmp" },
        { model: Department, as: "departmentDetails" },
        { model: BorrowingStatus, as: "statusDetails" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Unable to get all transactions. ", error);
    res
      .status(500)
      .json({ message: "Unable to get all transactions. ", error });
  }
};

//create lend transaction
export const createLendTransaction = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  const {
    borrowedItem,
    borrower,
    owner,
    quantity,
    status = 2,
    DPT_ID,
    remarks,
    RECEIVED_BY,
  } = request.body;

  if (!borrowedItem || !borrower || !owner || !quantity || !DPT_ID) {
    return response
      .status(400)
      .json({ message: "Required fields are empty. " });
  }

  //check if they lend themself
  if (borrower === owner) {
    return response.status(400).json({ message: "You can't lend yourself." });
  }

  try {
    //check if item exist in distributed items
    const isItemExist = (await ItemModel.findByPk(
      borrowedItem
    )) as ItemModelProps;

    const itemDistribute = (await Item.findOne({
      where: { ITEM_ID: borrowedItem },
    })) as ItemProps;

    //check if request quantity is more than the stock quantity
    if (quantity > itemDistribute.quantity) {
      return response.status(400).json({
        message: "Requesting quantity is more than the stock quantity.",
      });
    }

    if (!isItemExist) {
      return response.status(404).json({ message: "Item does not exist." });
    }

    const empBorrower = (await Employee.findByPk(borrower)) as any;

    const empOwner = (await Employee.findByPk(owner)) as any;

    const transaction = (await BorrowingTransaction.create({
      borrowedItem,
      borrower,
      owner,
      quantity,
      status,
      DPT_ID,
      remarks,
      RECEIVED_BY,
    })) as BorrowingTransactionProps;

    const user = (await User.findOne({
      where: { role: 1, DEPARTMENT_USER: DPT_ID },
    })) as any;

    //sending notification to the admin
    const adminNotification = await Notification.create({
      MESSAGE: `Owner ${empOwner.FIRSTNAME} ${empOwner.LASTNAME} ${
        empOwner.MIDDLENAME ?? ""
      } ${empOwner.SUFFIX ?? ""} would like to lend the ${
        isItemExist?.ITEM_NAME
      } to ${empBorrower.FIRSTNAME} ${empBorrower.LASTNAME} ${
        empBorrower.MIDDLENAME ?? ""
      } ${empBorrower.SUFFIX ?? ""}`,
      FOR_EMP: user.emp_id,
      TRANSACTION_ID: transaction.id,
    });

    //sending to admin notifcation
    const socketId = users.get(user.emp_id);

    request.io.to(socketId).emit("send-notification", {
      adminNotification,
    });

    //sending notification to borrower
    const borrowerNotification = await Notification.create({
      MESSAGE: `You are requesting to lend the ${isItemExist.ITEM_NAME} from ${
        empOwner.FIRSTNAME
      } ${empOwner.LASTNAME} ${empOwner.MIDDLENAME ?? ""} ${
        empOwner.SUFFIX ?? ""
      }`,
      FOR_EMP: empBorrower.ID,
      TRANSACTION_ID: transaction.id,
    });

    //send notifcation to borrower
    const borrowerSocketId = users.get(empBorrower.ID);

    request.io.to(borrowerSocketId).emit("send-notification", {
      borrowerNotification,
    });

    //send notifaciton to item owner
    const ownerNotification = await Notification.create({
      MESSAGE: `Your Item ${isItemExist.ITEM_NAME} ${quantity} pc(s) has been requested to be lend by ${empBorrower.FIRSTNAME}`,
      FOR_EMP: empOwner.ID,
      TRANSACTION_ID: transaction.id,
    });

    const ownerSocketId = users.get(empOwner.ID);

    request.io.to(ownerSocketId).emit("send-notification", {
      ownerNotification,
    });

    response.status(201).json("Successfully create the lend transaction.");
  } catch (error) {
    console.error("Unexpected error occured. ", error);
    response
      .status(500)
      .json({ message: "Unexpected error occurred. ", error });
  }
};

export const approvedLendTransaction = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  const { transactionId } = request.params;

  if (!transactionId) {
    return response
      .status(400)
      .json({ message: "Transaction Id was missing." });
  }

  try {
    const transaction = (await BorrowingTransaction.findByPk(
      transactionId
    )) as BorrowingTransactionProps;

    if (!transaction) {
      return response.status(404).json({ message: "Transaction not found." });
    }

    transaction.status = 1;

    //create a notification sending to borrower and owner about the rejected transaction
    //transaction for the borrower
    const notification = (await Notification.create({
      MESSAGE: "",
      FOR_EMP: transaction.borrower,
      TRANSACTION_ID: transaction.id,
    })) as NotificationProps;

    //saving the transaction
    const result = await transaction.save();

    request.io.emit("notification", notification);

    response.status(200).json({
      message: "Transaction approved successfully. ",
      result,
      notification,
    });
  } catch (error) {
    console.error("\x1b[32m\x1b[1m✔ Unexpecter error occured. ", error);
    response
      .status(500)
      .json({ message: "Unexpecter error occurred. ", error });
  }
};

//Reject transaction
export const rejectTransaction = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  const { transactionId } = request.params;

  if (!transactionId) {
    return response
      .status(400)
      .json({ message: "Transaction Id was missing." });
  }
  try {
    const transaction = (await BorrowingTransaction.findByPk(
      transactionId
    )) as BorrowingTransactionProps;

    if (!transaction) {
      return response.status(404).json({ message: "Transaction not found." });
    }

    transaction.status = 4; //reject transaction

    //create notification about the rejected transaction

    //notification for borrower
    const notificationForBorrower = await Notification.create({
      MESSAGE: "Transaction has been REJECTED.",
      FOR_EMP: transaction.borrower,
      TRANSACTION_ID: transaction.id,
    });

    //notification for owner
    const notificationForOwner = await Notification.create({
      MESSAGE: "The request has been REJECTED.",
      FOR_EMP: transaction.owner,
      TRANSACTION_ID: transaction.id,
    });

    //saving the transaction
    const result = await transaction.save();

    response.status(200).json({
      message: "Transaction was rejected. ",
      result,
      notificationForOwner,
      notificationForBorrower,
    });
  } catch (error) {
    console.error("\x1b[32m\x1b[1m✔ Unexpecter error occured. ", error);
    response
      .status(500)
      .json({ message: "Unexpecter error occurred. ", error });
  }
};
