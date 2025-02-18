import { Router } from "express";
import {
  addCategoryItem,
  editCategoryItems,
  getCategoryItems,
} from "../controllers/item_category_controller.js";

const item_category_routes = Router()
  .post("/", addCategoryItem)
  .get("/", getCategoryItems)
  .put("/:itemCatId", editCategoryItems);

export default item_category_routes;
