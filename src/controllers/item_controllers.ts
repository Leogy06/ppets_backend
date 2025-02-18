import express from "express";
import Item from "../models/item.js";
import { Op } from "sequelize";
import { ItemProps } from "../types/types.js";
import Employee from "../models/employee.js";
import Department from "../models/department.js";

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
      order: [["name", "ASC"]],
      include: [{ model: Employee, as: "itemCustodian" }],
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
    const item = (await Item.findByPk(id)) as ItemProps | null;

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
    item.unit_value = value || item.unit_value;
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

//get items base on who owned
export const getItemsByOwner = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const { empId } = req.params;
  try {
    if (!empId) {
      return res.status(400).json({ message: "Employee id is required." });
    }
    const ownedItems = await Item.findAll({
      where: { accountable_emp: empId },
    });

    res.status(200).json(ownedItems);
  } catch (error) {
    console.error(`Unable to get items - ${error}`);
    res.status(500).json({ message: `Unable to get items. - ${error} ` });
  }
};

//get item by employee's department
export const getItemByEmployeeDpt = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { department } = req.params;
  if (!department) {
    return res.status(400).json({ message: "Employee ID is missing." });
  }
  try {
    const isDeptExist = await Department.findByPk(department);

    if (!isDeptExist) {
      return res.status(404).json({ message: "Employee does not exist" });
    }

    const items = await Item.findAll({
      where: { belong_dpt: department },
      include: [{ model: Employee, as: "itemCustodian" }],
    });

    res.status(200).json(items);
  } catch (error) {
    console.error("Unable to get item by employee department. ", error);
    res
      .status(500)
      .json({ message: "unable to get item by employee. ", error });
  }
};

export const getItemById = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { itemId } = req.params;

  if (!itemId) {
    return res.status(400).json({ message: "Item id is required." });
  }
  try {
    const itemFound = await Item.findByPk(itemId);

    if (!itemFound) {
      return res.status(404).json({ message: "Item does not exist." });
    }

    res.status(200).json(itemFound);
  } catch (error) {
    console.error("Unable to get item by id. ", error);
    res.status(500).json({ message: "Unable to get item by id. ", error });
  }
};
