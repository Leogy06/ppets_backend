import { Router } from "express";
import { transactionController } from "../controllers/transactionController.js";
import {
  createBorrowTransaction,
  getBorrowingTransactionsByEmpId,
} from "../controllers/transactionsController/borrowTransactions.js";

//api in index - /transaction
const transactionRoutes = Router();

//get transaction by type(remarks) and department
transactionRoutes.get("", transactionController);

//borrow transaction
//create borrow transaction
transactionRoutes.post("/borrow", createBorrowTransaction);
transactionRoutes.get("/borrow", getBorrowingTransactionsByEmpId);

export default transactionRoutes;
