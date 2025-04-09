//example pdf report

import { Request, Response } from "express";
import {
  generateItemReportService,
  getPdfReportService,
} from "../services/pdfReportService.js";
import { handleServerError } from "../utils/errorHandler.js";

//report for transaction
export const getPdfReportController = async (req: Request, res: Response) => {
  const reports = req.body.reports;

  try {
    await getPdfReportService(res, reports);
  } catch (error) {
    handleServerError(res, error, "Unable to get pdf report.");
  }
};

//report fo item report
export const generateItemReportController = async (
  req: Request,
  res: Response
) => {
  try {
    await generateItemReportService(res, req.body.reports);
  } catch (error) {
    handleServerError(res, error, "Unable to generate item report.");
  }
};
