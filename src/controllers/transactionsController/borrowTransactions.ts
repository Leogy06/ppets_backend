//create borrow transaction

import { Request, Response } from "express";
import { handleServerError } from "../../utils/errorHandler.js";
import Item from "../../models/distributedItemModel.js";
import Employee from "../../models/employee.js";
import TransactionModel from "../../models/transactionModel.js";

//post - /transaction/borrow
export const createBorrowTransaction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const {
    DISTRIBUTED_ITM_ID,
    quantity,
    borrower_emp_id,
    owner_emp_id,
    TRANSACTION_DESCRIPTION,
  } = req.body;

  if (!DISTRIBUTED_ITM_ID || !quantity || !borrower_emp_id || !owner_emp_id) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    //promise all
    const [distributedItem, borrowee, owner] = await Promise.all([
      Item.findByPk(DISTRIBUTED_ITM_ID),
      Employee.findByPk(borrower_emp_id),
      Employee.findByPk(owner_emp_id),
    ]);

    //check if distributed item, borrowee and owner exist
    if (!distributedItem || !borrowee || !owner) {
      return res.status(404).json({ message: "Item or employee not found." });
    }

    //validate quantity
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0." });
    }

    //check if quantity is available
    if (distributedItem.getDataValue("quantity") < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough quantity available." });
    }

    //creating borrow transaction

    const newBorrowTransaction = await TransactionModel.create({
      DISTRIBUTED_ITM_ID,
      distributed_item_id: distributedItem.get("ITEM_ID"),
      borrower_emp_id,
      owner_emp_id,
      quantity,
      status: 2, // pending
      remarks: 1, //borrowing
      TRANSACTION_DESCRIPTION,
      DPT_ID: distributedItem.get("current_dpt_id"),
    });

    res.status(201).json(newBorrowTransaction);
  } catch (error) {
    handleServerError(res, error, "Unable to create borrow transaction");
  }
};
