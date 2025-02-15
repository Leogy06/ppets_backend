import { Router } from "express";
import {
  createBorrowTransaction,
  getBorrowTransactionByEmployee,
  getBorrowTransactions,
} from "../controllers/borrowing_controller.js";

const borrowing_routes = Router()
  .get("/", getBorrowTransactions)
  .post("/", createBorrowTransaction)
  .get("/borrower", getBorrowTransactionByEmployee);

export default borrowing_routes;
