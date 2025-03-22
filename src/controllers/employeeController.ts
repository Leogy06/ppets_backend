import { Request, Response } from "express";
import { handleServerError } from "../utils/errorHandler.js";
import employeeServices from "../services/employeeServices.js";

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeServices.getEmployees({
      departmentId: Number(req.query.departmentId),
      limit: Number(req.query.limit),
    });

    res.status(200).json(employees);
  } catch (error) {
    handleServerError(res, error, "Unable to get employees.");
  }
};
