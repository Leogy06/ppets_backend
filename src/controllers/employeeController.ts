import { Request, Response } from "express";
import { handleServerError } from "../utils/errorHandler.js";
import employeeServices from "../services/employeeServices.js";
import { logger } from "../logger/logger.js";

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

export const editEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await employeeServices.editEmployee(req.body);
    res.status(200).json(employee);
  } catch (error) {
    handleServerError(res, error, "Unable to edit employee.");
  }
};

export const deleteEmployees = async (req: Request, res: Response) => {
  const { IDs } = req.body;
  try {
    const employee = await employeeServices.deleteEmployee(IDs);
    res.status(200).json(employee);
  } catch (error) {
    handleServerError(res, error, "Unable to delete employee.");
  }
};

//get employee
export const getEmployeeByIdController = async (
  req: Request,
  res: Response
) => {
  const { employeeId } = req.params;

  try {
    const employee = await employeeServices.getEmployeeByIdService(
      Number(employeeId)
    );

    res.status(200).json(employee);
  } catch (error) {
    handleServerError(res, error, "Unable to get employee.");
  }
};
