import { Router } from "express";
import {
  getProcessingStatus,
  insertProcessingStatus,
} from "../controllers/processingStatus_controller.js";

const processingStatus_routes = Router()
  .get("/", getProcessingStatus)
  .post("/", insertProcessingStatus);

export default processingStatus_routes;
