import { Router } from "express";
import {
  addItem,
  editItem,
  getItems,
} from "../controllers/item_controllers.js";

const item_routes = Router();

item_routes.post("/", addItem).get("/", getItems).put("/:id", editItem);

export default item_routes;
