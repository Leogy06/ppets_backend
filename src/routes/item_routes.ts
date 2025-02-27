import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItems,
} from "../controllers/items_controller.js";
import itemValidationRules from "../middlewares/itemValidations.js";

const item_routes = Router()
  .post("/", itemValidationRules, createItem)
  .get("/", getItems)
  .delete("/:itemId/:action", deleteItem);

export default item_routes;
