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
  if (error instanceof Error) {
    logger.error(`Error: ${error.message}`);
    logger.error(`Stack Trace: ${error.stack}`);
  } else {
    logger.error(`Error: ${error}`);
  }

  if (error instanceof CustomError) {
    logger.error(`Custom Error: ${error.message}`);
    logger.error(`Custome Error, Stack Trace: ${error.stack}`);

    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  }
  return res.status(statusCode).json({ success: false, message });
};
