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

//notification count
export const getNotificationCountController = async (
  req: Request,
  res: Response
) => {
  const empId = Number(req.query.empId);
  try {
    const response = await notificationServices.getNotificationCountService({
      empId,
    });
    res.status(200).json(response);
  } catch (error) {
    handleServerError(res, error, "Unable to get notification count.");
  }
};

//get unread notification count
export const getUnreadNotificationCountController = async (
  req: Request,
  res: Response
) => {
  const { empId } = req.query;
  try {
    const result = await notificationServices.getUnreadNotificationCountService(
      Number(empId)
    );

    res.status(200).json(result);
  } catch (error) {
    handleServerError(res, error, "Unable to get unread notification count.");
  }
};

export const markNotificationAsReadController = async (
  req: Request,
  res: Response
) => {
  const { notificationIds } = req.body;
  try {
    const result = await notificationServices.markNotificationAsReadService(
      Array.isArray(notificationIds)
        ? notificationIds.map(Number)
        : [Number(notificationIds)]
    );
    res.status(200).json(result);
  } catch (error) {
    handleServerError(res, error, "Unable to mark notification as read.");
  }
};
