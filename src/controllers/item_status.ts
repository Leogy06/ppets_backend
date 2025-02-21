import express from "express";
import ItemStatus from "../models/item_status.js";

export const createItemStatus = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: "Required fields are empty" });
  }
  try {
    const result = await ItemStatus.create({ DESCRIPTION: description });

    res.status(200).json(result);
  } catch (error) {
    console.error("Unable to create Item Status. ", error);
    res.status(500).json({ message: "Unable to create Item Status. ", error });
  }
};
