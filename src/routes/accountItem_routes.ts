import express from "express";
import {
  createAccountCodeController,
  editAccoundCodeController,
  getAccountItems,
} from "../controllers/accountItemController.js";

const accountItemRoutes = express
  .Router()
  .get("/", getAccountItems)
  .post("/", createAccountCodeController)
  .put("/", editAccoundCodeController);

export default accountItemRoutes;
