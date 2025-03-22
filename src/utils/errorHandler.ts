// utils/errorHandler.ts
import { Response } from "express";
import { CustomError } from "./CustomError.js";
import { logger } from "../logger/logger.js";

export const handleServerError = (
  res: Response,
  error: unknown,
  message = "Internal Server Error",
  statusCode = 500
) => {
  logger.error(error); // Logs actual error details

  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  }
  return res.status(statusCode).json({ success: false, message });
};
