import express from "express";
import { transactionController } from "../controllers/transactionController.js";

//api in index - /transaction
const transactionRoutes = express.Router();

//get transaction by type and department
transactionRoutes.get("", transactionController);

export default transactionRoutes;
