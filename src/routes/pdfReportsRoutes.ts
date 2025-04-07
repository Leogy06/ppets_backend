import { Router } from "express";
import { getPdfReportController } from "../controllers/pdfReportsController.js";

const pdfReportRoutes = Router().post("/", getPdfReportController);

export default pdfReportRoutes;
