import Express from "express";
import { validationResult } from "express-validator";
import ItemModel from "../models/itemModel.js";
import { ItemModelProps } from "../@types/types.js";
import { Op } from "sequelize";
import AccountItem from "../models/accountItemModel.js";
import undistributedItemServices from "../services/undistributedItemService.js";

//distributed item
export const createItem = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const errors = validationResult(req); //check if required fields are missing

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    });
  }

  const {
    ITEM_NAME,
    DESCRIPTION,
    STOCK_QUANTITY,
    UNIT_VALUE,
    SERIAL_NO,
    PROP_NO,
    REMARKS,
    PAR_NO,
    DEPARTMENT_ID,
    RECEIVED_AT,
    MR_NO,
    ACCOUNT_CODE,
    ADDED_BY,
  } = req.body;

  try {
    //check if prop and srn is duplicated
    const isSrnExist = await ItemModel.count({ where: { SERIAL_NO } });
    const isPropExist = await ItemModel.count({ where: { PROP_NO } });
    const isParExist = await ItemModel.count({ where: { PAR_NO } });

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

    if (isParExist > 0) {
      return res
        .status(400)
        .json({ message: "Asset number was already in used." });
    }

    //validate stock quantity
    const stockNumber = Number(STOCK_QUANTITY);
    if (stockNumber <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity are equal to zero or below. " });
    }

    //check if quantity is decimal
    if (!Number.isInteger(stockNumber)) {
      return res
        .status(400)
        .json({ message: "Stock quantity must be a whole number." });
    }

    //validate unit value
    if (UNIT_VALUE <= 0) {
      return res
        .status(400)
        .json({ message: "Unit value are equal to zero or below." });
    }

    //checking received at, it should be in the past
    const receivedAtDate = new Date(RECEIVED_AT);
    const today = new Date();

    //check if received at is in the future
    if (receivedAtDate > today) {
      return res.status(400).json({
        message:
          "Received date should be pass by today's date. Since its impossible to receive this item ahead of item.",
      });
    }

    //create item
    const newItem = await ItemModel.create({
      ITEM_NAME,
      DESCRIPTION,
      STOCK_QUANTITY,
      UNIT_VALUE,
      TOTAL_VALUE: UNIT_VALUE * STOCK_QUANTITY,
      SERIAL_NO,
      PROP_NO,
      PAR_NO,
      REMARKS,
      ORIGINAL_QUANTITY: STOCK_QUANTITY,
      DEPARTMENT_ID,
      RECEIVED_AT,
      MR_NO,
      ACCOUNT_CODE,
      ADDED_BY,
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("unable to create item. ", error);
    res.status(500).json({ message: "Unable to create item. ", error });
  }
};

//get undistributed items
export const getUndistributedItems = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const { DEPARTMENT_ID, limit } = req.query;

  try {
    const undistributedItems =
      await undistributedItemServices.getUndistributedItemServices({
        limit: Number(limit),
        department: Number(DEPARTMENT_ID),
      });

    res.status(200).json(undistributedItems);
  } catch (error) {
    console.error("Unable to get items. ", error);
    res.status(500).json({ message: "Unable to get items. ", error });
  }
};

//set delete item
export const deleteItem = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const { ids } = req.body;

  const itemIds = Array.isArray(ids) ? ids : [ids];

  try {
    //find item with ids
    const itemExist = await ItemModel.findAll({
      where: { ID: { [Op.in]: itemIds } },
    });

    //check if the item are exists
    if (!itemExist.length) {
      return res
        .status(400)
        .json({ message: "Item does not exists. Can't proceed the action." });
    }

    //check if items has already deleted
    const alreadyDeleted = itemExist.every(
      (item) => item.getDataValue("DELETE") === 1
    );

    if (alreadyDeleted) {
      return res
        .status(400)
        .json({ message: "There was an item deleted already." });
    }

    //deleting the items
    const result = await ItemModel.update(
      { DELETE: 1 },
      { where: { ID: { [Op.in]: itemIds } } }
    );

    res.status(200).json({
      message: "Item(s) deleted successfully.",
      affectedRows: result[0],
      result,
    });
  } catch (error) {
    console.error("Unable to delete item. ", error);
    res.status(500).json({ message: "unable to delete item. ", error });
  }
};

//set restore item
export const restoreItem = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const { ids } = req.body;

  const itemIds = Array.isArray(ids) ? ids : [ids];

  try {
    //find item with ids
    const itemExist = await ItemModel.findAll({
      where: { ID: { [Op.in]: itemIds } },
    });

    //check if the item are exists
    if (!itemExist.length) {
      return res
        .status(400)
        .json({ message: "Item does not exists. Can't proceed the action." });
    }

    //check if items has already deleted
    const alreadyRestore = itemExist.every(
      (item) => item.getDataValue("DELETE") === 0
    );

    if (alreadyRestore) {
      return res
        .status(400)
        .json({ message: "There was an item has not deleted." });
    }

    //deleting the items
    const result = await ItemModel.update(
      { DELETE: 0 },
      { where: { ID: { [Op.in]: itemIds } } }
    );

    res.status(200).json({
      message: "Item(s) restored successfully.",
      affectedRows: result[0],
      result,
    });
  } catch (error) {
    console.error("Unable to delete item. ", error);
    res.status(500).json({ message: "unable to delete item. ", error });
  }
};

//get one undistributed item
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
