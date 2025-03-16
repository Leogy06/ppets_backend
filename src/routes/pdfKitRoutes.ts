import { Router } from "express";
import {
  downloadPdf,
  renderItemPDF,
  renderOwnedItemPDF,
  renderRequestPDF,
} from "../controllers/pdfKitController.js";

const pdfKitRoutes = Router()
  .get("/", downloadPdf)
  .post("/", renderRequestPDF)
  .post("/item", renderItemPDF)
  .post("/owned-items", renderOwnedItemPDF);

export default pdfKitRoutes;
