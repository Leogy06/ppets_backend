import { Request, Response } from "express";
import { handleServerError } from "../utils/errorHandler.js";
import notificationServices from "../services/notifcationServices.js";

export const getNoticationController = async (req: Request, res: Response) => {
  const empId = Number(req.query.empId);
  const limit = Number(req.query.limit);

  try {
    const response = await notificationServices.getNotificationService({
      empId,
      limit,
    });
    res.status(200).json(response);
  } catch (error) {
    handleServerError(res, error, "Unable to get notification.");
  }
};
