import { Router } from "express";
import {
  addCategoryItem,
  getCategoryItems,
} from "../controllers/item_category_controller.js";

const item_category_routes = Router()
  .post("/", addCategoryItem)
  .get("/", getCategoryItems);

export default item_category_routes;
