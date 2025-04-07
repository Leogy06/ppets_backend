import { Request, Response } from "express";
import { handleServerError } from "../utils/errorHandler.js";
import { buildTransactionService } from "../services/reportBuilderServices.js";

export const buildTransactionController = async (
  req: Request,
  res: Response
) => {
  const departmentId = Number(req.query.departmentId);
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  try {
    const result = await buildTransactionService({
      departmentId,
      startDate,
      endDate,
    });

    res.status(200).json(result);
  } catch (error) {
    handleServerError(
      res,
      error,
      "Error from Report Builder: Unable to build transaction."
    );
  }
};
