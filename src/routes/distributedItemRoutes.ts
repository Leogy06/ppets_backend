import { Router } from "express";
import {
  getDistributedItems,
  getItemByIdController,
} from "../controllers/distributedItemsController.js";

//distributed item routes
// /item
const distributedItemRoutes = Router()
  .get("/", getDistributedItems)
  .get("/:itemId", getItemByIdController);

export default distributedItemRoutes;
