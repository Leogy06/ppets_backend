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
import { Op, where } from "sequelize";
import { validationResult } from "express-validator";

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
        { model: TransactionRemarks, as: "transactionRemarksDetails" },
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

    //transaction identifier
    //check status if pending
    const status = Number(transaction.getDataValue("status"));
    const remarks = Number(transaction.getDataValue("remarks"));
    if (status !== 2) {
      return response
        .status(400)
        .json({ message: "Transaction status was not pending" });
    }

    //check remarks if its borrow or lend
    if (remarks !== 2 && remarks !== 1) {
      return response
        .status(400)
        .json({ message: "Transaction is not up for approval." });
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

    //join full name
    //update remarks
    const fullName = [
      empBorrower.LASTNAME,
      empBorrower.FIRSTNAME,
      empBorrower.MIDDLENAME,
      empBorrower.SUFFIX,
    ]
      .filter(Boolean) // removes null, undefined and ""
      .join(" "); //join names with a sing space
    distributedItem.remarks = `Lend: ${fullName}\nDate Lent: ${new Date().toDateString()}\n`;

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

    //transaction status
    const status = Number(transaction.getDataValue("status"));
    const remarks = Number(transaction.getDataValue("remarks"));

    if (status !== 2) {
      return response.status(400).json({
        message: "Transaction has already been approved or rejected. ",
      });
    }

    //check if it's a distribution
    if (remarks === 3) {
      return response.status(400).json({
        message: "Transaction can't be rejected for is a distribution. ",
      });
    }

    //check if it's a return
    if (remarks === 5) {
      return response.status(400).json({
        message: "Can't reject, for it's already returned",
      });
    }

    if (!transaction) {
      return response.status(404).json({ message: "Transaction not found." });
    }

    //update transaction to reject
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

/**
 * Create a new borrow transaction.
 *
 */
export const createBorrowTransaction = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  console.log("createBorrowTransaction was called.");

  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const {
    distributed_item_id,
    borrower_emp_id,
    owner_emp_id,
    quantity,
    DPT_ID,
    remarks,
  } = request.body;

  try {
    // Retrieve the item, item distributed, borrower, and owner.
    const [item, itemDistributed, borrower, owner, dpt] = await Promise.all([
      ItemModel.findByPk(distributed_item_id),
      Item.findOne({
        where: { accountable_emp: owner_emp_id, ITEM_ID: distributed_item_id },
      }),
      Employee.findByPk(borrower_emp_id),
      Employee.findByPk(owner_emp_id),
      Department.findByPk(DPT_ID),
    ]);

    // Validate the existance of the item, item distributed, borrower, and owner.
    if (!item) {
      console.error("Item not found.");
      return response.status(404).json({ message: "Item not found." });
    }
    if (!itemDistributed) {
      console.log("item distributed not found.");

      return response
        .status(404)
        .json({ message: "Item distributed not found." });
    }
    if (!borrower) {
      console.log("Borrower not found.");

      return response.status(404).json({ message: "Borrower not found." });
    }
    if (!owner) {
      console.log("Owner not found.");

      return response.status(404).json({ message: "Owner not found." });
    }
    if (!dpt) {
      console.log("Department not found.", dpt);

      return response.status(404).json({ message: "Department not found." });
    }

    //check if quantity is zero or negative
    if (quantity <= 0) {
      return response.status(400).json({ message: "Quantity is not valid." });
    }

    //check if quantity is available in item undistributed
    if (quantity > itemDistributed.getDataValue("quantity")) {
      console.log(
        "item distributed quantity: ",
        itemDistributed.getDataValue("quantity")
      );
      console.log("Quantity inputted: ", quantity);

      return response.status(400).json({
        message: "Quantity is more than stocked quantity of the item.",
      });
    }

    // Create a new borrow transaction.
    const transaction = await BorrowingTransaction.create({
      distributed_item_id,
      borrower_emp_id,
      owner_emp_id,
      quantity,
      DPT_ID,
      remarks: 1, //1 is borrowing (transaction type)
      status: 2, //2 is pending (status of the process)
      TRANSACTION_DESCRIPTION: remarks,
    });

    response.status(200).json({
      message: "Transaction created successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Unable to create borrow transaction.", error);
    response
      .status(500)
      .json({ message: "Unable to create borrow transaction." });
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

    //employee counts
    //and also not deleted

    const employeeDptCount = await Employee.count({
      where: { CURRENT_DPT_ID: DPT_ID, DELETED: 0 },
    });

    res.status(200).json({
      transactionCount,
      transactionCountToday,
      itemCountDepartment,
      employeeDptCount,
    });
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

//create return transaction
export const createReturnTransaction = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  console.log("createReturnTransaction was called.");

  //front end should get these values from transaction ID
  const { id: transaction_id } = req.body;

  if (!transaction_id) {
    return res.status(400).json({ message: "Transaction ID is missing. " });
  }

  try {
    const transaction = (await BorrowingTransaction.findByPk(
      transaction_id
    )) as BorrowingTransactionProps;

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    //check if transaction is approved
    if (transaction.getDataValue("status") !== 1) {
      return res.status(400).json({ message: "Transaction is not approved." });
    }

    //check if transaction is already returned
    if (transaction.getDataValue("remarks") === 5) {
      return res
        .status(400)
        .json({ message: "Transaction has already returned." });
    }

    //check if transaction is already pending
    if (transaction.getDataValue("status") === 2) {
      return res
        .status(400)
        .json({ message: "Transaction is already pending return." });
    }

    //check if transaction was rejected
    if (transaction.getDataValue("status") === 4) {
      return res.status(400).json({ message: "Transaction was rejected." });
    }

    //check if transaction already requesting for return
    if (transaction.getDataValue("remarks") === 5) {
      return res
        .status(400)
        .json({ message: "Transaction is already requesting return." });
    }

    //update transaction to return and pending
    transaction.status = 2; // pending
    transaction.remarks = 5; // return

    const newTransaction = await transaction.save();

    res.status(200).json(newTransaction);
  } catch (error) {
    console.error("Unable to create return transaction. ", error);
    res
      .status(500)
      .json({ message: "Unable to create return transaction.", error });
  }
};

//for borrowed items / approved and in used
export const getBorrowedItems = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { borrower_emp_id } = req.query;

  if (!borrower_emp_id) {
    return res.status(400).json({ message: "Borrower ID is missing. " });
  }

  try {
    const transactions = await BorrowingTransaction.findAll({
      where: {
        status: 1, //approved
        borrower_emp_id, //the borrower emp id,
        remarks: 1, //borrowing
      },
      include: [
        { model: Employee, as: "borrowerEmp" },
        { model: Employee, as: "ownerEmp" },
        { model: ItemModel, as: "itemDetails" },
        { model: TransactionRemarks, as: "transactionRemarksDetails" },
      ],
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Unable to get borrowed items. ", error);
    res.status(500).json({ message: "Unable to get borrowed items.", error });
  }
};

//approve return item
export const approveReturnItemTransaction = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { id: transactionId } = req.body;

  if (!transactionId) {
    return res.status(400).json({ message: "Transaction ID is missing. " });
  }

  try {
    const transaction = (await BorrowingTransaction.findByPk(
      transactionId
    )) as BorrowingTransactionProps;

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (
      transaction.getDataValue("status") !== 2 &&
      transaction.getDataValue("remarks") !== 5
    ) {
      return res.status(400).json({ message: "Item is not up for return." });
    }

    //check if transaction is pending
    const status = Number(transaction.getDataValue("status"));
    if (status !== 2) {
      return res.status(400).json({
        message: "Transaction is not pending return.",
        status,
      });
    }

    //check if transaction is a return

    const remarks = Number(transaction.getDataValue("remarks"));
    if (remarks !== 5) {
      return res.status(400).json({
        message: "Transaction is not requesting return.",
        remarks,
      });
    }

    //distributed item
    const ITEM_ID = Number(transaction.getDataValue("distributed_item_id"));
    const accountable_emp = Number(transaction.getDataValue("owner_emp_id"));
    const item = (await Item.findOne({
      where: {
        ITEM_ID,
        accountable_emp,
      },
    })) as ItemProps;

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found.", itemFound: item });
    }

    //updating the item quantity
    //adding the borrowed quantity as it returns
    item.quantity += transaction.getDataValue("quantity");

    //updating the transaction (approving)
    transaction.status = 1; //approved

    //saving the transaction
    const newTransaction = await transaction.save();

    //saving the item
    const newItem = await item.save();

    res.status(200).json({ newTransaction, newItem });
  } catch (error) {
    console.error("Unable to approve return item transaction. ", error);
    res
      .status(500)
      .json({ message: "Unable to approve return item transaction.", error });
  }
};

//create a transfer of item transaction
export const createTransferTransaction = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const {
    item_id: itemId,
    newAccountablePerson,
    quantityTransferred,
  } = req.body;

  if (!itemId || !newAccountablePerson || !quantityTransferred) {
    return res.status(400).json({ message: "Required fields are missing." });
  }
  try {
    //check if item exist
    const item = await Item.findByPk(itemId);

    //check if item exist
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    //check if new accountable person exist
    const accountablePerson = await Employee.findByPk(newAccountablePerson);

    //check if new accountable person exist
    if (!accountablePerson) {
      return res
        .status(404)
        .json({ message: "New accountable person not found." });
    }

    //check if quantity is valid
    if (quantityTransferred <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0." });
    }

    //check if item exist in distributed
    const itemDistributed = await Item.findByPk(itemId);
    //check if item exist in distributed
    if (!itemDistributed) {
      return res
        .status(404)
        .json({ message: "Item not found in distributed." });
    }

    //check if quantity is valid
    if (quantityTransferred > itemDistributed.getDataValue("quantity")) {
      return res.status(400).json({
        message:
          "Quantity transferred is greater than the quantity in distributed.",
      });
    }

    //create transfer transaction
    const newTransaction = await BorrowingTransaction.create({
      distributed_item_id: itemDistributed.getDataValue("ITEM_ID"),
      owner_emp_id: accountablePerson.getDataValue("ID"),
      quantity: quantityTransferred,
      status: 2, //pending
      remarks: 4, //transfer
      DPT_ID: accountablePerson.getDataValue("CURRENT_DPT_ID"),
    });

    res.status(201).json({ newTransaction });
  } catch (error) {
    console.error("Unable to create transfer transaction. ", error);
    res
      .status(500)
      .json({ message: "Unable to create transfer transaction.", error });
  }
};

//approve transfer items
export const approveTransferItemTransaction = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { itemId, newAccountablePerson, quantityTransferred, transaction_id } =
    req.body; //distributed id

  if (!itemId) {
    return res.status(400).json({ message: "Item ID is missing. " });
  }

  try {
    const findDistributed = await Item.findByPk(itemId);

    if (!findDistributed) {
      return res.status(404).json({ message: "Item not found." });
    }

    //find transaction id
    const transaction = await BorrowingTransaction.findByPk(transaction_id);

    if (!transaction_id) {
      return res.status(400).json({ message: "Transaction Id is missing. " });
    }

    //check if the status and remarks are pending and transffered
    if (
      transaction?.getDataValue("status") !== 2 &&
      transaction?.getDataValue("remarks") !== 5
    ) {
      return res
        .status(400)
        .json({ message: "Transaction is not pending transfer." });
    }

    //create transaction for the approved transfer
    const newTransaction = await BorrowingTransaction.create({
      distributed_item_id: findDistributed.getDataValue("ITEM_ID"),
      owner_emp_id: newAccountablePerson,
      quantity: quantityTransferred,
      status: 1, //approved
      remarks: 5, //transfer
    });

    //updating the item quantity
    const newTransferred = await Item.create({
      accountable_emp: newAccountablePerson,
      ITEM_ID: findDistributed.getDataValue("ITEM_ID"),
      quantity: quantityTransferred,
    });

    res.status(200).json({ newTransferred, newTransaction });
  } catch (error) {
    console.error("Unable to approve transfer item transaction. ", error);
    res
      .status(500)
      .json({ message: "Unable to approve transfer item transaction.", error });
  }
};
