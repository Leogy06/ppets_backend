import { Router } from "express";
import { fetchEmployeeOptionsController } from "../controllers/optionFetcherController.js";

const optionFetcherRoutes = Router().get(
  "/employee",
  fetchEmployeeOptionsController
);

export default optionFetcherRoutes;
