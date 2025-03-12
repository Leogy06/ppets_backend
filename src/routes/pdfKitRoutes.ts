import { Router } from "express";
import {
  downloadPdf,
  renderItemPDF,
  renderRequestPDF,
} from "../controllers/pdfKitController.js";

const pdfKitRoutes = Router()
  .get("/", downloadPdf)
  .post("/", renderRequestPDF)
  .post("/item", renderItemPDF);

export default pdfKitRoutes;
