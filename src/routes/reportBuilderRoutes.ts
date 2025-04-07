import { Router } from "express";
import { buildTransactionController } from "../controllers/reportBuilderController.js";

const reportBuilderRoutes = Router();

//transaction reports
reportBuilderRoutes.get("/transaction", buildTransactionController);

export default reportBuilderRoutes;
