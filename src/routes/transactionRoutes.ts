import { Router } from "express";
import {
  approvedLendTransaction,
  createBorrowTransaction,
  createLendTransaction,
  createReturnTransaction,
  editBorrowTransaction,
  getBorrowedItems,
  getBorrowingTransactionByDpt,
  getBorrowTransactionByEmployee,
  getBorrowTransactions,
  getCountAllTimeRequestDepartment,
  getCountTodayRequestDepartment,
  getTransactionApprovedOwnerDepartment,
  rejectTransaction,
} from "../controllers/transactionController.js";
import transactionValidationRules from "../middlewares/transactionValidation.js";

//root route : /transaction

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
  .get("/get/approved/:ownerEmpId", getTransactionApprovedOwnerDepartment)

  //counts for dashboard
  .get("/count/all_time/:DPT_ID", getCountAllTimeRequestDepartment)
  .get("/count/today/:DPT_ID", getCountTodayRequestDepartment)

  //create borrow transaction route
  .post("/borrow", transactionValidationRules, createBorrowTransaction)

  //getting borrowed items transactions to track
  .get("/borrowed_items", getBorrowedItems)
  //initiate a return transaction
  .post("/return", createReturnTransaction)
  //approving the return transaction
  .put("/approve/return");

export default transactionRoutes;
