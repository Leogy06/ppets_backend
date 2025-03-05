import Express from "express";
import { validationResult } from "express-validator";
import ItemModel from "../models/itemModel.js";
import { ItemModelProps } from "../@types/types.js";

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
    RECEIVED_AT,
    PIC_NO,
  } = req.body;
  try {
    //check if prop and srn is duplicated
    const [isSrnExist, isPropExist] = await Promise.all([
      await ItemModel.count({ where: { SERIAL_NO } }),
      await ItemModel.count({ where: { PROP_NO } }),
    ]);

    if (isSrnExist > 0) {
      return res
        .status(400)
        .json({ message: "Serial number was already in used." });
    }

    if (isPropExist > 0) {
      return res
        .status(400)
        .json({ message: "Prop number was already in used." });
    }

    const newItem = await ItemModel.create({
      ITEM_NAME,
      DESCRIPTION,
      STOCK_QUANTITY,
      UNIT_VALUE,
      TOTAL_VALUE: UNIT_VALUE * STOCK_QUANTITY,
      SERIAL_NO,
      PROP_NO,
      REMARKS,
      ORIGINAL_QUANTITY: STOCK_QUANTITY,
      DEPARTMENT_ID,
      RECEIVED_AT,
      PIC_NO,
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

//set delete or restore item
export const deleteItem = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const { itemId } = req.params;

  const action = Number(req.params.action);

  if (!itemId) {
    return res.status(400).json({ message: "Item id is required. " });
  }

  console.log("action ", action);

  if (action === null || action === undefined) {
    return res.status(400).json({ message: "Action is required. " });
  }

  if (isNaN(action)) {
    return res.status(400).json({ message: "Action is not a number" });
  }

  try {
    const item = (await ItemModel.findByPk(itemId)) as ItemModelProps;

    if (!item) {
      return res.status(404).json({ message: "Item does not exist. " });
    }

    item.DELETE = action;
    const result = await item.save();

    const message =
      action === 1
        ? "Item was deleted"
        : action === 0
        ? "Item was restored"
        : "Unknown action.";
    res.status(200).json({ message, result });
  } catch (error) {
    console.error("Unable to delete item. ", error);
    res.status(500).json({ message: "unable to delete item. ", error });
  }
};

export const getUndistributedItem = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const itemId = Number(req.params.itemId);

  if (!itemId) return res.status(400).json({ message: "Item id is required." });

  if (isNaN(itemId))
    return res.status(400).json({ message: "Item id is not a number." });

  try {
    const item = await ItemModel.findByPk(itemId);

    if (!item) return res.status(404).json({ message: "Item does not exist." });

    res.status(200).json(item);
  } catch (error) {
    console.error("unable to get undistributed item. ", error);
    res
      .status(500)
      .json({ message: "Unable to get undistributed item. ", error });
  }
};
