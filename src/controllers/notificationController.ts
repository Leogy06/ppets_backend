import { Request, Response } from "express";
import { handleServerError } from "../utils/errorHandler.js";
import notificationServices from "../services/notifcationServices.js";

export const getNoticationController = async (req: Request, res: Response) => {
  try {
    const response = await notificationServices.getNotificationService({
      empId: Number(req.query.empId),
      limit: Number(req.query.limit),
    });
    res.status(200).json(response);
  } catch (error) {
    handleServerError(res, error, "Unable to get notification.");
  }
};
