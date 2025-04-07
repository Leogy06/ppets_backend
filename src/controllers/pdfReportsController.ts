//example pdf report

import { Request, Response } from "express";
import { getPdfReportService } from "../services/pdfReportService.js";
import { handleServerError } from "../utils/errorHandler.js";

export const getPdfReportController = async (req: Request, res: Response) => {
  const reports = req.body.reports;
  try {
    await getPdfReportService(res, reports);
  } catch (error) {
    handleServerError(res, error, "Unable to get pdf report.");
  }
};
