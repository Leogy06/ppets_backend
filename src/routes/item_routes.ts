import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItems,
  getUndistributedItem,
  restoreItem,
} from "../controllers/items_controller.js";
import itemValidationRules from "../middlewares/itemValidations.js";

//undistributed items
const item_routes = Router()
  .post("/", itemValidationRules, createItem)
  .get("/:itemId", getUndistributedItem) // by item id
  .get("/", getItems)
  .delete("/delete", deleteItem)
  .put("/restore", restoreItem);

export default item_routes;
