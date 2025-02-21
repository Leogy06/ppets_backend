import Express from "express";
import { validationResult } from "express-validator";
import Notification from "../models/notificationModel.js";

export const createNotification = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  const { message, for_user } = req.body;

  try {
    const notification = await Notification.create({
      MESSAGE: message,
      FOR_USER: for_user,
    });

    req.io.emit("notification", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error("Unable to create notification. ", error);
    res.status(500).json({ message: "Unable to create notification. ", error });
  }
};
