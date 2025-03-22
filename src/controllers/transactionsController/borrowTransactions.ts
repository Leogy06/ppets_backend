//create borrow transaction

import { Request, Response } from "express";
import { handleServerError } from "../../utils/errorHandler.js";
import transactionServices from "../../services/transactionServices.js";

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
    const newBorrowTransaction =
      await transactionServices.createBorrowingTransaction({
        DISTRIBUTED_ITM_ID,
        quantity,
        borrower_emp_id,
        owner_emp_id,
        TRANSACTION_DESCRIPTION,
      });

    res.status(201).json(newBorrowTransaction);
  } catch (error) {
    handleServerError(res, error, "Unable to create borrow transaction");
  }
};
