import { Request, Response } from "express";
import { handleServerError } from "../utils/errorHandler.js";
import transactionServices from "../services/transactionServices.js";
//transaction controller

export const getTransactions = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { DPT_ID, TRANSACTION_TYPE, EMP_ID, LIMIT } = req.query;

  // Check if required query params are empty
  if (!DPT_ID || !TRANSACTION_TYPE) {
    return res
      .status(400)
      .json({ message: "Query params are empty.", DPT_ID, TRANSACTION_TYPE });
  }

  try {
    const transactions = await transactionServices.getTransactions(
      Number(DPT_ID),
      Number(EMP_ID),
      Number(LIMIT),
      Number(TRANSACTION_TYPE)
    );

    res.status(200).json(transactions);
  } catch (error) {
    handleServerError(res, error, "Unable to get transactions.");
  }
};

//create borrow transaction
export const createTransaction = async (req: Request, res: Response) => {
  const {
    DISTRIBUTED_ITM_ID,
    quantity,
    borrower_emp_id,
    owner_emp_id,
    TRANSACTION_DESCRIPTION,
    status,
    remarks,
  } = req.body;

  try {
    const newBorrowTransaction =
      await transactionServices.createTransactionService({
        distributed_item_id: 0,
        DISTRIBUTED_ITM_ID,
        quantity,
        borrower_emp_id,
        owner_emp_id,
        TRANSACTION_DESCRIPTION,
        status,
        remarks,
      });

    res.status(201).json(newBorrowTransaction);
  } catch (error) {
    handleServerError(res, error, "Unable to create borrow transaction");
  }
};
