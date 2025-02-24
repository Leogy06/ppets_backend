import { Router } from "express";
import {
  createBorrowTransaction,
  editBorrowTransaction,
  getBorrowingTransactionByDpt,
  getBorrowTransactionByEmployee,
  getBorrowTransactions,
} from "../controllers/borrowing_controller.js";

const borrowing_routes = Router()
  .get("/", getBorrowTransactions)
  .post("/", createBorrowTransaction)
  .get("/borrower", getBorrowTransactionByEmployee)
  .put("/update", editBorrowTransaction)
  //get all borrowing transaction by department
  .get("/byDpt", getBorrowingTransactionByDpt);

export default borrowing_routes;
