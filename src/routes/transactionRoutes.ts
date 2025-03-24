import { Router } from "express";
import {
  createTransaction,
  editTransaction,
  getTransactions,
  rejectTransaction,
} from "../controllers/transactionController.js";
import validateTransaction from "../middlewares/validateTransaction.js";
import { transactionShema } from "../validations/transactionValidation.js";

//transaction routes

//api in index - /transaction
const transactionRoutes = Router()
  .get("/", getTransactions)
  .post("/", validateTransaction(transactionShema), createTransaction)
  .put("/", validateTransaction(transactionShema), editTransaction)
  .put("/reject", rejectTransaction);

export default transactionRoutes;
