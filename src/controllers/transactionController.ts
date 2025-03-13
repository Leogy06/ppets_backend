import express from "express";
import BorrowingTransaction from "../models/transactionModel.js";
import Item from "../models/distributedItemModel.js";
import Employee from "../models/employee.js";
import {
  BorrowingTransactionProps,
  EmployeeProps,
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
import TransactionRemarks from "../models/btRemarksModel.js";
import { Op } from "sequelize";

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
      where: { owner_emp_id: owner },

      order: [["createdAt", "DESC"]],
      include: [
        { model: ItemModel, as: "itemDetails" },
        { model: BorrowingStatus, as: "statusDetails" },
        { model: Employee, as: "ownerEmp" },
        { model: Employee, as: "borrowerEmp" },
        { model: Employee, as: "approvedByEmpDetails" },
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
      where: { borrower_emp_id: empIdNo },
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
      borrowTransaction.distributed_item_id
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
        { model: ItemModel, as: "itemDetails" }, //undistributed to get the distribute date
        { model: Employee, as: "ownerEmp" },
        { model: Department, as: "departmentDetails" },
        { model: BorrowingStatus, as: "statusDetails" },
        { model: TransactionRemarks, as: "transactionRemarksDetails" },
        { model: Employee, as: "approvedByEmpDetails" },
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
//by employee
export const createLendTransaction = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  const {
    distributed_item_id,
    borrower_emp_id,
    owner_emp_id,
    quantity,
    status = 2,
    DPT_ID,
    remarks,
    RECEIVED_BY,
  } = request.body;

  if (
    !distributed_item_id ||
    !borrower_emp_id ||
    !owner_emp_id ||
    !quantity ||
    !DPT_ID
  ) {
    return response.status(400).json({
      message: "Required fields are empty. ",
      distributed_item_id,
      borrower_emp_id,
      owner_emp_id,
      quantity,
      DPT_ID,
    });
  }

  //check if they lend themself
  if (borrower_emp_id === owner_emp_id) {
    return response.status(400).json({ message: "You can't lend yourself." });
  }

  //check if quantity is negative
  const isQuantityValid = Number(quantity);

  if (!Number.isInteger(isQuantityValid)) {
    return response
      .status(400)
      .json({ message: "Quantity is should NOT be decimal." });
  }

  if (isQuantityValid <= 0) {
    return response
      .status(400)
      .json({ message: "Quantity should not below or equal to zero. " });
  }

  try {
    //check if item exist in distributed items
    const isItemExist = (await Item.findByPk(distributed_item_id)) as ItemProps;

    if (!isItemExist) {
      return response.status(404).json({
        message: "Item does not exist.",
        isItemExist,
        distributed_item_id,
      });
    }

    //check if request quantity is more than the stock quantity
    if (quantity > isItemExist.quantity) {
      return response.status(400).json({
        message: "Requesting quantity is more than the stock quantity.",
      });
    }

    //check if lending quantity is negative
    if (quantity < 0) {
      return response.status(400);
    }

    //check if item exist in the undistributed item
    const itemUndistributed = (await ItemModel.findByPk(
      distributed_item_id
    )) as ItemModelProps;

    if (!itemUndistributed) {
      return response
        .status(404)
        .json({ message: "Item in the undistributed was not found." });
    }

    //check if it has special characters
    const empBorrower = (await Employee.findByPk(borrower_emp_id)) as any;

    const empOwner = (await Employee.findByPk(owner_emp_id)) as any;

    //create the transaction
    const transaction = (await BorrowingTransaction.create({
      distributed_item_id,
      borrower_emp_id,
      owner_emp_id,
      quantity,
      status,
      DPT_ID,
      RECEIVED_BY,
      remarks: 2,
    })) as BorrowingTransactionProps;

    const user = (await User.findOne({
      where: { role: 1, DEPARTMENT_USER: DPT_ID },
    })) as any;

    //sending notification to the admin
    const adminNotification = await Notification.create({
      MESSAGE: `Owner ${empOwner.FIRSTNAME} ${empOwner.LASTNAME} ${
        empOwner.MIDDLENAME ?? ""
      } ${empOwner.SUFFIX ?? ""} would like to lend the ${
        itemUndistributed?.ITEM_NAME
      } to ${empBorrower.FIRSTNAME} ${empBorrower.LASTNAME} ${
        empBorrower.MIDDLENAME ?? ""
      } ${empBorrower.SUFFIX ?? ""}`,
      FOR_EMP: user?.emp_id,
      TRANSACTION_ID: transaction.id,
    });

    //sending to admin notifcation
    const socketId = users.get(user.emp_id);

    request.io.to(socketId).emit("send-notification", adminNotification);

    //sending notification to borrower
    const borrowerNotification = await Notification.create({
      MESSAGE: `You are requesting to lend the ${
        itemUndistributed.ITEM_NAME
      } from ${empOwner.FIRSTNAME} ${empOwner.LASTNAME} ${
        empOwner.MIDDLENAME ?? ""
      } ${empOwner.SUFFIX ?? ""}`,
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
      MESSAGE: `Your Item ${itemUndistributed.ITEM_NAME} ${quantity} pc(s) has been requested to be lend by ${empBorrower.FIRSTNAME}`,
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

//reduce item's quantity
//create notification
//update transaction status
export const approvedLendTransaction = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  const { transactionId, approverId } = request.params;

  if (!transactionId) {
    return response
      .status(400)
      .json({ message: "Transaction Id was missing." });
  }

  if (!approverId) {
    return response.status(400).json({ message: "Approver Id was missing." });
  }

  try {
    const transaction = (await BorrowingTransaction.findByPk(
      transactionId
    )) as BorrowingTransactionProps;

    if (!transaction) {
      return response.status(404).json({ message: "Transaction not found." });
    }

    //deduc the quantity of that item

    //first find the item in distributed item

    const distributedItem = (await Item.findOne({
      where: {
        ITEM_ID: transaction.distributed_item_id,
        accountable_emp: transaction.owner_emp_id,
      },
    })) as ItemProps;

    if (!distributedItem) {
      return response.status(404).json({
        message: "Item does not exist. ",
        distributedItem,
        ITEM_ID: transaction.distributed_item_id,
        accountable_emp: transaction.owner_emp_id,
      });
    }

    //check if transaction quantity has more than distributed item quantity
    if (transaction.quantity > distributedItem.quantity) {
      return response.status(400).json({
        message:
          "The item quantity stocked has more than requested. Please cancel this transaction.",
      });
    }

    //find the borrower if exist
    const empBorrower = (await Employee.findByPk(
      transaction.borrower_emp_id
    )) as any;

    if (!empBorrower) {
      return response
        .status(404)
        .json({ messag: "Employee borrower does'nt exist. ", empBorrower });
    }

    //find owner
    const ownerEmp = (await Employee.findByPk(transaction.owner_emp_id)) as any;

    if (!ownerEmp) {
      return response
        .status(404)
        .json({ message: "Employee owner does'nt exist. ", ownerEmp });
    }

    //reduciing the stock quantity of the item.
    distributedItem.quantity -= transaction.quantity;

    //adding remarks in distributed items for tracking of their items

    //ensure this is a string so concat function properly
    const currentRemarks = distributedItem.remarks ?? "";

    //join full name
    const fullName = [
      empBorrower.LASTNAME,
      empBorrower.FISTNAME,
      empBorrower.MIDDLENAME,
      empBorrower.SUFFIX,
    ]
      .filter(Boolean) // removes null, undefined and ""
      .join(" "); //join names with a sing space
    distributedItem.remarks = `${currentRemarks}, Lend to ${fullName}`;

    //setting the status to approve (1)
    transaction.status = 1;

    //inserting the approver id to transaction
    transaction.APPROVED_BY = Number(approverId);

    //find if the item exist in undistribute items
    const undistributedItem = (await ItemModel.findByPk(
      distributedItem.ITEM_ID
    )) as ItemModelProps;

    if (!undistributedItem) {
      return response
        .status(404)
        .json({ message: "Item not found in undistributed item lists." });
    }

    //create a notification sending to borrower and owner about the rejected transaction
    //transaction for the borrower
    const notification = (await Notification.create({
      MESSAGE: `Item ${undistributedItem.ITEM_NAME} item has been approved by the admin. You can now claim the item if it's not in your custody.`,
      FOR_EMP: empBorrower.ID,
      TRANSACTION_ID: transaction.id,
    })) as NotificationProps;

    //owner notification
    const notificationForOwner = await Notification.create({
      MESSAGE: `**Subject: APPROVAL Item Request **
      Dear, ${ownerEmp.LASTNAME} ${ownerEmp.FIRSTNAME} ${
        ownerEmp.MIDDLENAME ?? ""
      } ${ownerEmp.SUFFIX ?? ""} your item ${
        undistributedItem.ITEM_NAME
      } has been lent to ${empBorrower.LASTNAME} ${empBorrower.FIRSTNAME} ${
        empBorrower.MIDDLENAME ?? ""
      } ${
        empBorrower.SUFFIX ?? ""
      } and is ready to give to borrower if not given yet.`,
      FOR_EMP: ownerEmp.ID,
      TRANSACTION_ID: transaction.id,
    });

    //
    //saving the transaction
    const result = await transaction.save();

    //saving item
    const itemResult = await distributedItem.save();

    //notification here
    //sending notificaiton to borrower
    request.io
      .to(String(empBorrower.ID))
      .emit("send-notification", notification);

    //sending notificaiton to owner
    request.io
      .to(String(ownerEmp.ID))
      .emit("send-notification", notificationForOwner);

    response.status(200).json({
      message: "Transaction approved successfully. ",
      result,
      notification,
      itemResult,
    });
  } catch (error) {
    console.error("\x1b[31m\x1b[1m✖ Unexpecter error occured. ", error);
    response
      .status(500)
      .json({ message: "Unexpected error occurred. ", error });
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
      FOR_EMP: transaction.borrower_emp_id,
      TRANSACTION_ID: transaction.id,
    });

    //notification for owner
    const notificationForOwner = await Notification.create({
      MESSAGE: "The request has been REJECTED.",
      FOR_EMP: transaction.owner_emp_id,
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

//get the transactions approved and by owner in the transaction
export const getTransactionApprovedOwnerDepartment = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { ownerEmpId } = req.params;

  if (!ownerEmpId) {
    return res.status(400).json({
      message: "Department ID or Owner Employee ID was missing. ",
      ownerEmpId,
    });
  }

  try {
    //get transaction by owner and approved status
    //in order to track their items that has been borrowed
    const transactions = await BorrowingTransaction.findAll({
      where: {
        owner_emp_id: ownerEmpId,
        status: 1,
        borrower_emp_id: { [Op.ne]: null },
      },
      include: [
        { model: Employee, as: "borrowerEmp" },
        { model: ItemModel, as: "itemDetails" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error(
      "Unable to get approved, owwner and department transaction. ",
      error
    );
    res.status(500).json({
      message: "Unable to get approved, owwner and department transaction. ",
      error,
    });
  }
};

//transaction counts for dashboard
export const getCountAllTimeRequestDepartment = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { DPT_ID } = req.params;

  if (!DPT_ID) {
    return res.status(400).json({ message: "Department ID is missing. " });
  }

  try {
    const transactionCount = await BorrowingTransaction.count({
      where: { DPT_ID },
    });

    //today's trasaction
    const today = new Date();
    today.setHours(0, 0, 0, 0); //start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // start of next day

    const transactionCountToday = await BorrowingTransaction.count({
      where: {
        DPT_ID,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    //item count not quantity
    const itemCountDepartment = await ItemModel.count({
      where: {
        DEPARTMENT_ID: DPT_ID,
      },
    });

    res
      .status(200)
      .json({ transactionCount, transactionCountToday, itemCountDepartment });
  } catch (error) {
    console.error("Unable to get the count of transactions. ", error);
    res
      .status(500)
      .json({ message: "Unable to get the count of transactions." });
  }
};

//get count transaction request today by department
export const getCountTodayRequestDepartment = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { DPT_ID } = req.params;

  if (!DPT_ID) {
    return res.status(400).json({ message: "Department ID is missing. " });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); //start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // start of next day

    const transactionCount = await BorrowingTransaction.count({
      where: {
        DPT_ID,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    return res.status(200).json(transactionCount);
  } catch (error) {
    console.error("Unable to get the count of transactions. ", error);
    res
      .status(500)
      .json({ message: "Unable to get the count of transactions." });
  }
};
