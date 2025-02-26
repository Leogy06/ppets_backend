import Express from "express";
import { validationResult } from "express-validator";
import ItemModel from "../models/itemModel.js";

//distributed item
export const createItem = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const errors = validationResult(req); //check if required fields are missing

  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  const {
    ITEM_NAME,
    DESCRIPTION,
    STOCK_QUANTITY,
    UNIT_VALUE,
    SERIAL_NO,
    PROP_NO,
    REMARKS,
    DEPARTMENT_ID,
  } = req.body;
  try {
    const newItem = await ItemModel.create({
      ITEM_NAME,
      DESCRIPTION,
      STOCK_QUANTITY,
      UNIT_VALUE,
      TOTAL_VALUE: UNIT_VALUE * STOCK_QUANTITY,
      SERIAL_NO,
      PROP_NO,
      REMARKS,
      ORIGINAL_STOCK: STOCK_QUANTITY,
      DEPARTMENT_ID,
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("unable to create item. ", error);
    res.status(500).json({ message: "Unable to create item. ", error });
  }
};

export const getItems = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const { DEPARTMENT_ID } = req.query;

  if (!DEPARTMENT_ID) {
    return res.status(400).json({ message: "Department ID is required. " });
  }
  try {
    const items = await ItemModel.findAll({
      where: { DEPARTMENT_ID },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(items);
  } catch (error) {
    console.error("Unable to get items. ", error);
    res.status(500).json({ message: "Unable to get items. ", error });
  }
};
