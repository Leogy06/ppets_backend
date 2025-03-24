import { Router } from "express";
import {
  createItem,
  deleteItem,
  getUndistributedItem,
  getUndistributedItems,
  getUndistributedItemsCount,
  restoreItem,
} from "../controllers/items_controller.js";
import itemValidationRules from "../middlewares/itemValidations.js";

//undistributed items
// /api/item
const item_routes = Router()
  .post("/", itemValidationRules, createItem)
  .get("/:itemId", getUndistributedItem) // by item id
  .get("/", getUndistributedItems)
  .delete("/delete", deleteItem)
  .put("/restore", restoreItem)
  .get("/api/count", getUndistributedItemsCount);

export default item_routes;
