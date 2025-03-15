import express from "express";
import { getAccountItems } from "../controllers/accountItemController.js";

const accountItemRoutes = express.Router().get("/", getAccountItems);

export default accountItemRoutes;
