import { Router } from "express";
import { createItemStatus } from "../controllers/item_status.js";

const itemStatus_route = Router().post("/", createItemStatus);

export default itemStatus_route;
