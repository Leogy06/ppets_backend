import { Router } from "express";
import {
  getDistributedItems,
  getItemByIdController,
} from "../controllers/distributedItemsController.js";

const distributedItemRoutes = Router()
  .get("/", getDistributedItems)
  .get("/:itemId", getItemByIdController);

export default distributedItemRoutes;
