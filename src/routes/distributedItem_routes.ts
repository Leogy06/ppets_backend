import { Router } from "express";
import {
  addItem,
  deleteItem,
  editItem,
  getItemByEmployeeDpt,
  getItemById,
  getItems,
  getItemsByOwner,
} from "../controllers/distributedItems_controller.js";

const distributedItem_routes = Router()
  //add item
  .post("/", addItem)

  //get items
  .get("/", getItems)

  //get item by id
  .get("/byId/:itemId", getItemById)

  //edit item
  .put("/:id", editItem)

  //delete item
  .delete("/", deleteItem)

  //get items by owned
  .get("/:empId", getItemsByOwner)

  .get("/byDepartment/:department", getItemByEmployeeDpt);

export default distributedItem_routes;
