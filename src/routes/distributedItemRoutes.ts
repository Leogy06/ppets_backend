import { Router } from "express";
import {
  addDistributedItemController,
  getDistributedItems,
  getItemByIdController,
} from "../controllers/distributedItemsController.js";
import validateDistributedItem from "../middlewares/validateDistributedItem.js";
import distributedItemDetails from "../validations/distributedItemValidation.js";

//distributed item routes
// /item
const distributedItemRoutes = Router()
  .get("/", getDistributedItems)
  .get("/:itemId", getItemByIdController)
  .post(
    "/",
    validateDistributedItem(distributedItemDetails),
    addDistributedItemController
  );

export default distributedItemRoutes;
