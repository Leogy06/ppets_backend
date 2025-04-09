import { Router } from "express";
import {
  generateItemReportController,
  getPdfReportController,
} from "../controllers/pdfReportsController.js";

const pdfReportRoutes = Router()
  .post("/", getPdfReportController)
  .post("/items", generateItemReportController);

export default pdfReportRoutes;
