import { Router } from "express";
import {
  approveReturnTransactionController,
  approveTransferTransactionController,
  createTransaction,
  editTransaction,
  getTransactionCountController,
  getTransactionCountTodayController,
  getTransactions,
  rejectTransaction,
  getTransactionByIdController,
  returnTransactionController,
} from "../controllers/transactionController.js";
import validateTransaction from "../middlewares/validateTransaction.js";
import { transactionShema } from "../validations/transactionValidation.js";

//transaction routes

//api in index - /transaction
const transactionRoutes = Router()
  .get("/", getTransactions)
  .post("/", validateTransaction(transactionShema), createTransaction)
  .put("/", validateTransaction(transactionShema), editTransaction)
  .put("/reject", rejectTransaction)
  .put("/approve/transfer", approveTransferTransactionController)
  .put("/approve/return", approveReturnTransactionController)
  .get("/api/count", getTransactionCountController)
  .get("/api/count/today", getTransactionCountTodayController)
  .get("/:transactionId", getTransactionByIdController)
  //return items
  .post("/return", returnTransactionController);

export default transactionRoutes;
