// utils/errorHandler.ts
import { Response } from "express";

export const handleServerError = (
  res: Response,
  error: unknown,
  message = "Internal Server Error"
) => {
  console.error(error); // Logs actual error details
  return res.status(500).json({ success: false, message });
};
