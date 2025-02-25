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

  const { item_id, item_reciever, item_quantity } = req.body;
  try {
    const newItem = (await ItemModel.create({
      ITEM_ID: item_id,
      ITEM_RECIEVER: item_reciever,
      ITEM_QUANTITY: item_quantity,
      RECEIVED_AT: new Date(),
    })) as ItemModelProps;

    res.status(201).json(newItem);
  } catch (error) {
    console.error("unable to create item. ", error);
    res.status(500).json({ message: "Unable to create item. ", error });
  }
};

export const getItems = async (req: Express.Request, res: Express.Response) => {
  try {
    const items = (await ItemModel.findAll()) as ItemModelProps[];

    res.status(200).json(items);
  } catch (error) {
    console.error("Unable to get items. ", error);
    res.status(500).json({ message: "Unable to get items. ", error });
  }
};
