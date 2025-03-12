import { Router } from "express";
import {
  approvedLendTransaction,
  createLendTransaction,
  editBorrowTransaction,
  getBorrowingTransactionByDpt,
  getBorrowTransactionByEmployee,
  getBorrowTransactions,
  getTransactionApprovedOwnerDepartment,
  rejectTransaction,
} from "../controllers/transactionController.js";

const transactionRoutes = Router()
  .get("/", getBorrowTransactions)
  .get("/borrower", getBorrowTransactionByEmployee)
  .put("/update", editBorrowTransaction)
  //get all borrowing transaction by department
  .get("/byDpt", getBorrowingTransactionByDpt)
  //create lend transaction
  .post("/lend", createLendTransaction)
  //approve
  .put("/approve/:transactionId/:approverId", approvedLendTransaction)
  //reject
  .put("/reject/:transactionId", rejectTransaction)
  //get transaction by owner and approved status
  //in order to track their items that has been borrowed
  .get("/get/approved/:ownerEmpId", getTransactionApprovedOwnerDepartment);

export default transactionRoutes;
