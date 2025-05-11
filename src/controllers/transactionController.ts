import { Request, Response } from "express";
import { handleServerError } from "../utils/errorHandler.js";
import transactionServices from "../services/transactionServices.js";
import notificationServices from "../services/notifcationServices.js";
import { users } from "../sockets/socketManager.js";
import User from "../models/user.js";
//transaction controller

export const getTransactions = async (req: Request, res: Response) => {
  const { DPT_ID, TRANSACTION_TYPE, EMP_ID, LIMIT } = req.query;

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
    //create transaction
    const newTransaction = await transactionServices.createTransactionService({
      DISTRIBUTED_ITM_ID,
      quantity,
      borrower_emp_id,
      owner_emp_id,
      TRANSACTION_DESCRIPTION,
      status,
      remarks,
    });

    if (newTransaction) {
      //create notification
      await notificationServices.createTransactionNotificationService(
        newTransaction.getDataValue("id")
      );
    }

    res.status(201).json(newTransaction);
  } catch (error) {
    handleServerError(res, error, "Unable to create borrow transaction");
  }
};

//edit transaction, for approve only
export const editTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await transactionServices.editTransactionService(
      req.body
    );

    //creating the notification
    await notificationServices.createTransactionNotificationService(
      transaction.getDataValue("id"),
      req.body.status
    );

    //send the transaction
    res.status(200).json(transaction);
  } catch (error) {
    handleServerError(res, error, `Unable to edit transaction - ${error}.`);
  }
};

//reject transaction for reject
export const rejectTransaction = async (req: Request, res: Response) => {
  try {
    // * find transaction
    const transaction = await transactionServices.rejectTransactionService(
      req.body.data
    );

    //create notification
    await notificationServices.createTransactionNotificationService(
      req.body.data,
      4 //reject
    );
    res.status(200).json(transaction);
  } catch (error) {
    handleServerError(res, error, "Unable to reject transaction.");
  }
};

//approve return
export const approveTransferTransactionController = async (
  req: Request,
  res: Response
) => {
  try {
    const transaction =
      await transactionServices.approveTransferTransactionService(
        req.body.transactionId,
        Number(req.query.APPROVED_BY)
      );

    //creating approve notification
    await notificationServices.createTransactionNotificationService(
      transaction.getDataValue("id")
    );
    res.status(200).json(transaction);
  } catch (error) {
    handleServerError(res, error, "Unable to approve transaction");
  }
};

//approve return transaction
export const approveReturnTransactionController = async (
  req: Request,
  res: Response
) => {
  const { transactionId } = req.body;
  const { APPROVED_BY } = req.query;

  try {
    const transaction =
      await transactionServices.approveReturnTransactionService(
        transactionId,
        Number(APPROVED_BY)
      );

    //create approve notification
    await notificationServices.createTransactionNotificationService(
      transaction.getDataValue("id")
    );

    res.status(200).json(transaction);
  } catch (error) {
    handleServerError(res, error, "Unable to approve transaction");
  }
};

//get transaction count
export const getTransactionCountController = async (
  req: Request,
  res: Response
) => {
  const remarks = Number(req.query.remarks);
  const DPT_ID = Number(req.query.DPT_ID);
  try {
    const transactionCount =
      await transactionServices.getTransactionCountService(remarks, DPT_ID);

    res.status(200).json(transactionCount);
  } catch (error) {
    handleServerError(res, error, "Unable to get transaction count.");
  }
};

//get transaction count today controller
export const getTransactionCountTodayController = async (
  req: Request,
  res: Response
) => {
  const DPT_ID = Number(req.query.DPT_ID);
  try {
    const transactionCount =
      await transactionServices.getTransactionCountTodayService(DPT_ID);
    res.status(200).json(transactionCount);
  } catch (error) {
    handleServerError(res, error, "Unable to get transaction count today");
  }
};

export const getTransactionByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const transactionId = Number(req.params.transactionId);
    const result = await transactionServices.getTransactionById(transactionId);
    res.status(200).json(result);
  } catch (error) {
    handleServerError(res, error, "Unable to get transaction by id.");
  }
};

//return transaction
export const returnTransactionController = async (
  req: Request,
  res: Response
) => {
  try {
    const transaction = await transactionServices.editReturnTransactionService(
      req.body
    );

    await notificationServices.createTransactionNotificationService(
      transaction.getDataValue("id")
    );

    res.status(200).json(transaction);
  } catch (error) {
    handleServerError(res, error, "Unable to return transaction");
  }
};
