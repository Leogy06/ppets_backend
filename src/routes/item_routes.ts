import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItems,
  getUndistributedItem,
} from "../controllers/items_controller.js";
import itemValidationRules from "../middlewares/itemValidations.js";

//undistributed items
const item_routes = Router()
  .post("/", itemValidationRules, createItem)
  .get("/:itemId", getUndistributedItem) // by item id
  .get("/", getItems)
  .delete("/:itemId/:action", deleteItem);

export default item_routes;
