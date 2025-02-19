import { Router } from "express";
import {
  createBorrowTransaction,
  editBorrowTransaction,
  getBorrowTransactionByEmployee,
  getBorrowTransactions,
} from "../controllers/borrowing_controller.js";

const borrowing_routes = Router()
  .get("/", getBorrowTransactions)
  .post("/", createBorrowTransaction)
  .get("/borrower", getBorrowTransactionByEmployee)
  .put("/update", editBorrowTransaction);

export default borrowing_routes;
