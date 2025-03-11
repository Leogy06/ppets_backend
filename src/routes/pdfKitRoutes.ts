import { Router } from "express";
import {
  downloadPdf,
  renderRequestPDF,
} from "../controllers/pdfKitController.js";

const pdfKitRoutes = Router().get("/", downloadPdf).post("/", renderRequestPDF);

export default pdfKitRoutes;
