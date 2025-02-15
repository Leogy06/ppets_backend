import express from "express";
import BorrowingTransaction from "../models/borrowing_logs.js";
import Item from "../models/item.js";
import Employee from "../models/employee.js";
import { where } from "sequelize";
import sequelize from "../db/config.js";
import { ItemProps } from "../types/types.js";

export const getBorrowTransactions = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { owner } = req.query;
  try {
    if (!owner) {
      return res.status(400).json({ message: "Owner id is required." });
    }
    const borrows = await BorrowingTransaction.findAll({ where: { owner } });

    if (borrows.length === 0) {
      return res.status(400).json({ message: "No borrow transaction." });
    }

    res.status(200).json(borrows);
  } catch (error) {
    console.error("Unable to get borrows: ", error);
    res.status(500).json({ message: "Unable to get borrows. ", error });
  }
};

export const createBorrowTransaction = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const { borrowedItems } = req.body;
  const { owner, borrower } = req.query;
  try {
    if (!Array.isArray(borrowedItems)) {
      return res
        .status(400)
        .json({ message: "Invalid input, expected an array of items." });
    }

    if (borrowedItems.length === 0) {
      return res.status(400).json({ message: "No items has been sent." });
    }

    if (!owner || !borrower) {
      return res.status(400).json({ message: "Owner or borrower required." });
    }

    const employees = await Employee.findAll({
      where: { id: [borrower, owner] },
      attributes: ["ID"],
    });

    if (employees.length !== 2) {
      return res
        .status(404)
        .json({ message: "Owner or borrower does not exist." });
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
      await Item.update(
        { quantity: sequelize.literal(`quantity - ${item.quantity}`) },
        { where: { id: item.id } }
      );

      await BorrowingTransaction.create({
        borrowedItem: item.id,
        borrower,
        owner,
        quantity: item.quantity,
        status: item.status,
        remarks: item.remarks,
      });
    }

    res.status(201).json({ message: "Items successfully lend." });
  } catch (error) {
    console.error("Unable to create transaction(s). ", error);
    res
      .status(500)
      .json({ message: "Unable to create transaction(s). ", error });
  }
};

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
          as: "name",
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
