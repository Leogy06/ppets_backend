import { Router } from "express";
import {
  buildItemReportController,
  buildTransactionController,
} from "../controllers/reportBuilderController.js";

const reportBuilderRoutes = Router();

//transaction reports

// api - /api/build-report
reportBuilderRoutes
  .get("/transaction", buildTransactionController)
  .get("/items", buildItemReportController);

export default reportBuilderRoutes;
