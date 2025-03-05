import { Router } from "express";
import { downloadPdf } from "../controllers/pdfKitController.js";

const pdfKitRoutes = Router().get("/", downloadPdf);

export default pdfKitRoutes;
