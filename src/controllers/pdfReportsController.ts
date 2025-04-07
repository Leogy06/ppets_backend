//example pdf report

import { Request, Response } from "express";
import { getPdfReportService } from "../services/pdfReportService.js";
import { handleServerError } from "../utils/errorHandler.js";

export const getPdfReportController = (req: Request, res: Response) => {
  const reports = req.body.reports;

  try {
    const pdfReport = getPdfReportService(res, reports);
    res.status(200).json(pdfReport);
  } catch (error) {
    handleServerError(res, error, "Unable to get pdf report.");
  }
};
