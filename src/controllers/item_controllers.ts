import express from "express";
import Item from "../models/item.js";
import { Op } from "sequelize";

interface ItemAttributes extends Item {
  id?: number;
  name: string;
  description: string;
  quantity: number;
  emp_owner: number;
  ics: string;
  are_no: string;
  prop_no: string;
  serial_no: string;
  value: number;
  status: string;
  category_item?: number;
  deleted?: number;
  added_by: number;
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
    pis_no,
    class_no,
    acc_code,
    unit_value,
    accountable_emp,
    //no need total value,
    remarks,
    //status should be one upon creating
    category_item,
    //deleted is 0 ofcourse
    added_by,
    //added auto generate
    //created auto generate
  } = request.body;

  console.log(request.body);

  try {
    if (
      !name ||
      !description ||
      !quantity ||
      !unit_value ||
      !category_item ||
      !added_by
    ) {
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
      pis_no,
      class_no,
      acc_code,
      unit_value,
      accountable_emp,
      total_value: unit_value * quantity,
      remarks,
      status: 1,
      category_item,
      added_by,
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

//delete item
export const deleteItem = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const { ids } = req.body;
  try {
    if (!ids) {
      return res.status(404).json({ message: "Id is required." });
    }

    const itemIds = Array.isArray(ids) ? ids : [ids];

    const itemExist = await Item.findAll({
      where: { id: { [Op.in]: itemIds } },
    });

    if (!itemExist) {
      return res.status(404).json({
        message: "Unable to edit . - Item doesn't exist.",
      });
    }

    if (!itemExist.length) {
      return res
        .status(400)
        .json({ message: "Unable to delete item. - Item does not exist." });
    }

    const alreadyDeleted = itemExist.every(
      (item) => item.getDataValue("deleted") === 1
    );

    if (alreadyDeleted) {
      return res
        .status(400)
        .json({ message: "Theres an item deleted already." });
    }

    const deletedItems = await Item.update(
      { deleted: 1, updatedAt: new Date() },
      { where: { id: { [Op.in]: itemIds } } }
    );

    res.status(200).json(deletedItems);
  } catch (error) {
    console.error(`Unable to delete item. - ${error}`);
    res.status(500).json({ message: `Unable to delete item. - ${error}` });
  }
};
