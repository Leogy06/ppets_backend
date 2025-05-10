import express from "express";
import {
  createAccountCodeController,
  getAccountItems,
} from "../controllers/accountItemController.js";

const accountItemRoutes = express
  .Router()
  .get("/", getAccountItems)
  .post("/", createAccountCodeController);

export default accountItemRoutes;
