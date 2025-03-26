import { Router } from "express";
import {
  addDistributedItemController,
  getDistributedItems,
  getDistributedItemsByEmpIdCountController,
  getDistributedItemsCountController,
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
  )
  .get("/api/count", getDistributedItemsCountController)
  .get("/api/count/employee_item", getDistributedItemsByEmpIdCountController);

export default distributedItemRoutes;
