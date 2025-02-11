import { Router } from "express";
import {
  addItem,
  deleteItem,
  editItem,
  getItems,
} from "../controllers/item_controllers.js";

const item_routes = Router()
  //add item
  .post("/", addItem)

  //get items
  .get("/", getItems)

  //edit item
  .put("/:id", editItem)

  //delete item
  .delete("/", deleteItem);

export default item_routes;
