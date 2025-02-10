import { Router } from "express";
import {
  addItem,
  editItem,
  getItems,
} from "../controllers/item_controllers.js";

const item_routes = Router()
  //add item
  .post("/", addItem)

  //get items
  .get("/", getItems)

  //edit item
  .put("/:id", editItem);

export default item_routes;
