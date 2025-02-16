import express from "express";
import User_type from "../models/user_type.js";

export const addUserType = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: "Description is required" });
  }
  try {
    const newUserType = await User_type.create({ description });
    res.status(200).json({ newUserType });
  } catch (error) {
    console.error("Unable to add user types. ", error);
    res.status(500).json({ message: "Unable to add user type. ", error });
  }
};
