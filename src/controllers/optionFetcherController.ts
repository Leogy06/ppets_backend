import { Request, Response } from "express";
import { handleServerError } from "../utils/errorHandler.js";
import { fetchEmployeeOptionService } from "../services/optionFetcherService.js";

export const fetchEmployeeOptionsController = async (
  req: Request,
  res: Response
) => {
  const departmentId = Number(req.query.departmentId);

  try {
    const result = await fetchEmployeeOptionService(departmentId);

    res.status(200).json(result);
  } catch (error) {
    handleServerError(res, error, "Unable to fetch employee options.");
  }
};
