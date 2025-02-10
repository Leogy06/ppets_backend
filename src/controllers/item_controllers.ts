import express from "express";
import Item from "../models/item.js";

interface ItemAttributes extends Item {
  id?: number;
  name: string;
  description: string;
  quantity: number;
  ics: string;
  are_no: string;
  prop_no: string;
  serial_no: string;
  value: number;
  status: string;
  category_item?: number;
  deleted?: number;
}
//get items not deleted
//and ascend by description
export const addItem = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  const {
    name,
    description,
    quantity,
    ics,
    are_no,
    prop_no,
    serial_no,
    value,
    category_item,
  } = request.body;
  try {
    if (!name || !description || !quantity || !value) {
      return response.status(400).json({ message: "All fields are required." });
    }

    const newItem = await Item.create({
      name,
      description,
      quantity,
      ics,
      are_no,
      prop_no,
      serial_no,
      value,
      category_item,
      status: 1,
    });
    response.status(201).json(newItem);

    // Proceed with adding the item to the database or further processing
  } catch (error) {
    console.error(`Unable to add item. - ${error}`);
    response.status(500).json({ message: `Unable to add item. - ${error}` });
  }
};

//add items
export const getItems = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  try {
    const items = await Item.findAll({
      where: { deleted: 0 },
      order: [["description", "ASC"]],
    });
    response.status(200).json(items);
  } catch (error) {
    console.error(`Unable to retrieve items. - ${error}`);
    response
      .status(500)
      .json({ message: `Unable to retrieve items. - ${error}` });
  }
};

//edit item
export const editItem = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  const { id } = request.params;
  const {
    name,
    description,
    quantity,
    ics,
    are_no,
    prop_no,
    serial_no,
    value,
    status,
    category_item,
  } = request.body;

  try {
    const item = (await Item.findByPk(id)) as ItemAttributes | null;

    if (!item) {
      return response.status(404).json({ message: "Item not found." });
    }

    item.name = name || item.name;
    item.description = description || item.description;
    item.quantity = quantity || item.quantity;
    item.ics = ics || item.ics;
    item.are_no = are_no || item.are_no;
    item.prop_no = prop_no || item.prop_no;
    item.serial_no = serial_no || item.serial_no;
    item.value = value || item.value;
    item.status = status || item.status;
    item.category_item = category_item || item.category_item;

    await item.save();
    response.status(200).json(item);
  } catch (error) {
    console.error(`Unable to edit item. - ${error}`);
    response.status(500).json({ message: `Unable to edit item. - ${error}` });
  }
};
