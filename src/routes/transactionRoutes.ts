import { Router } from "express";
import {
  createBorrowTransaction,
  createLendTransaction,
  editBorrowTransaction,
  getBorrowingTransactionByDpt,
  getBorrowTransactionByEmployee,
  getBorrowTransactions,
} from "../controllers/borrowing_controller.js";

const transactionRoutes = Router()
  .get("/", getBorrowTransactions)
  .post("/", createBorrowTransaction)
  .get("/borrower", getBorrowTransactionByEmployee)
  .put("/update", editBorrowTransaction)
  //get all borrowing transaction by department
  .get("/byDpt", getBorrowingTransactionByDpt)
  //create lend transaction
  .post("/lend", createLendTransaction);

export default transactionRoutes;
