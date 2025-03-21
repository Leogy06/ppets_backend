import express from "express";
import { handleServerError } from "../utils/errorHandler.js";
import transactionServices from "../services/transactionServices.js";

export const transactionController = async (
  req: express.Request,
  res: express.Response
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
