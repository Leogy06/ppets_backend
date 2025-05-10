import express, { Request, Response } from "express";
import {
  createAccountCodeService,
  editAccountCodeService,
  getAllAccountCodeService,
} from "../services/accountCodeServices.js";
import { handleServerError } from "../utils/errorHandler.js";

export const getAccountItems = async (req: Request, res: Response) => {
  try {
    const response = await getAllAccountCodeService();

    res.status(200).json(response);
  } catch (error) {
    handleServerError(res, error, "Unable to get all account codes.");
  }
};

export const createAccountCodeController = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await createAccountCodeService(req.body);
    res.status(201).json(response);
  } catch (error) {
    handleServerError(res, error, "Unable to create account code.");
  }
};

//edit account code
export const editAccoundCodeController = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await editAccountCodeService(req.body);
    res.status(200).json(response);
  } catch (error) {
    handleServerError(res, error, "Unable to edit account code.");
  }
};
