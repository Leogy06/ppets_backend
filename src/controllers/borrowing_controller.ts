import express from "express";
import BorrowingTransaction from "../models/borrowing_logs.js";
import Item from "../models/item.js";
import Employee from "../models/employee.js";
import sequelize from "../db/config.js";
import {
  BorrowingTransactionProps,
  EmployeeProps,
  ItemProps,
} from "../@types/types.js";
import Notification from "../models/notificationModel.js";
import {
  forUser,
  handleMessageNotification,
} from "../functions/borrowingNotification.js";
import { users } from "../sockets/socketManager.js";

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
      include: [
        { model: Employee, as: "borrowerEmp" },
        { model: Item, as: "borrowedItemDetails" },
        { model: Employee, as: "ownerEmp" },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (borrows.length === 0) {
      return res.status(400).json({ message: "No borrow transaction." });
    }

    res.status(200).json(borrows);
  } catch (error) {
    console.error("Unable to get borrows: ", error);
    res.status(500).json({ message: "Unable to get borrows. ", error });
  }
};

//creating borrowing transaction
export const createBorrowTransaction = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const { borrowedItems } = req.body;
  const owner = Number(req.query.owner);
  const borrower = Number(req.query.borrower);

  if (!Array.isArray(borrowedItems) || borrowedItems.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid or empty items of array." });
  }

  if (borrowedItems.length === 0) {
    return res.status(400).json({ message: "No items has been sent." });
  }

  if (!owner || !borrower) {
    return res.status(400).json({ message: "Owner or borrower required." });
  }

  try {
    const [empBorrower, empOwner] = await Promise.all([
      (await Employee.findByPk(borrower)) as EmployeeProps | null,
      (await Employee.findByPk(owner)) as EmployeeProps | null,
    ]);

    if (!empBorrower || !empOwner) {
      return res
        .status(404)
        .json({ message: "Borrower or owner does not exist." });
    }

    //check if all items exist
    let invalidItems: number[] = [];

    let insufficientQuantity: {
      id: number;
      available: number;
      requested: number;
    }[] = [];

    for (const item of borrowedItems) {
      const foundItem = (await Item.findByPk(item.id)) as ItemProps;
      if (!foundItem) {
        invalidItems.push(item.id);
      } else if (foundItem.quantity < item.quantity) {
        insufficientQuantity.push({
          id: item.id,
          available: foundItem.quantity,
          requested: item.quantity,
        });
      }
    }

    if (invalidItems.length > 0) {
      return res
        .status(404)
        .json({ message: "Some items do not exist.", invalidItems });
    }

    if (insufficientQuantity.length > 0) {
      return res.status(400).json({
        message: "Insufficient stock for some items",
        insufficientQuantity,
      });
    }

    for (const item of borrowedItems) {
      //if the status was 1 (approved), deduct the quantity
      if (item.status === 1) {
        await Item.update(
          { quantity: sequelize.literal(`quantity - ${item.quantity}`) },
          { where: { id: item.id } }
        );
      }

      const notification = await Notification.create({
        MESSAGE: handleMessageNotification({
          statusProcess: item.status,
          itemOwner: `${empOwner.LASTNAME} ${empOwner.FIRSTNAME}`,
          itemBorrower: `${empBorrower?.LASTNAME ?? ""} ${
            empBorrower.FIRSTNAME
          }`,
          itemName: item.name,
        }),
        FOR_EMP: forUser({ status_process: item.status, owner, borrower }),
      });

      const recipientUserId = forUser({
        status_process: item.status,
        owner,
        borrower,
      });

      if (recipientUserId) {
        const recipientSocketId = users.get(recipientUserId);
        if (recipientSocketId) {
          req.io.to(recipientSocketId).emit("notification", notification);
        } else {
          console.log(
            `⚠️  No active socket found for user ${recipientSocketId}`
          );
        }
      }

      await BorrowingTransaction.create({
        borrowedItem: item.id,
        borrower,
        owner,
        quantity: item.quantity,
        status: item.status,
        remarks: item.remarks,
      });
    }

    res.status(201).json({ message: "Borrowing transaction created." });
  } catch (error) {
    console.error("Unable to create transaction(s). ", error);
    res
      .status(500)
      .json({ message: "Unable to create transaction(s). ", error });
  }
};

//borrower
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
          model: Item,
          as: "borrowedItemDetails",
        },
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
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Unable to get all transactions. ", error);
    res
      .status(500)
      .json({ message: "Unable to get all transactions. ", error });
  }
};
