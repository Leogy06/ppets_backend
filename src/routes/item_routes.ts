import { Router } from "express";
import {
  addItem,
  deleteItem,
  editItem,
  getItems,
  getItemsByOwner,
} from "../controllers/item_controllers.js";

const item_routes = Router()
  //add item
  .post("/", addItem)

  //get items
  .get("/", getItems)

  //edit item
  .put("/:id", editItem)

  //delete item
  .delete("/", deleteItem)

  //get items by owned
  .get("/:empId", getItemsByOwner);

export default item_routes;
