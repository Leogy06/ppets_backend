import { Router } from "express";
import {
  createTransaction,
  getTransactions,
} from "../controllers/transactionController.js";
import validateTransaction from "../middlewares/validateTransaction.js";
import { transactionShema } from "../validations/transactionValidation.js";

//transaction routes

//api in index - /transaction
const transactionRoutes = Router();

//get transactions
transactionRoutes.get("/", getTransactions);

//borrow transaction
//create borrow transaction
transactionRoutes.post(
  "/",
  validateTransaction(transactionShema),
  createTransaction
);
export default transactionRoutes;
