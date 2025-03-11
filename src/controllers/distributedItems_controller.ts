import express from "express";
import Item from "../models/distributedItemModel.js";
import { Op } from "sequelize";
import { ItemModelProps, ItemProps } from "../@types/types.js";
import Department from "../models/department.js";
import ItemModel from "../models/itemModel.js";
import Notification from "../models/notificationModel.js";
import BorrowingTransaction from "../models/transactionModel.js";
import Employee from "../models/employee.js";
import { users } from "../sockets/socketManager.js";

//distribute item to employee by the admin
export const addItem = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  const {
    ITEM_ID,
    quantity,
    ics,
    pis_no,
    acct_code,
    accountable_emp,
    DISTRIBUTED_BY,
    are_no,
    remarks,
  } = request.body;

  if (!quantity || !accountable_emp || !DISTRIBUTED_BY || !are_no) {
    return response
      .status(400)
      .json({ message: "All fields are required.", request: request.body });
  }

  //check if quantity is below zero
  if (quantity <= 0) {
    return response
      .status(400)
      .json({ message: "Quantity should below or equal to zero." });
  }

  const isQtyDecimal = Number(quantity);

  if (!Number.isInteger(isQtyDecimal)) {
    return response
      .status(400)
      .json({ message: "Quantity should NOT be Decimal." });
  }

  try {
    const undistributedItem = (await ItemModel.findByPk(
      ITEM_ID
    )) as ItemModelProps;

    if (!undistributedItem)
      return response.status(404).json({ message: "Item does not exist." });

    if (quantity > undistributedItem.STOCK_QUANTITY) {
      return response
        .status(400)
        .json({ message: "Quantity are much more than the stock." });
    }

    //check if prop, are # are duplicated
    const isAreExist = await Item.count({ where: { are_no } });

    if (isAreExist > 0)
      return response.status(400).json({ message: " Are # already exist." });

    //deduct the quantity in the undistributed
    undistributedItem.STOCK_QUANTITY -= quantity;

    //create borrow transaction saying the transaction has accomplished.
    await BorrowingTransaction.create({
      distributed_item_id: ITEM_ID,
      RECEIVED_BY: accountable_emp,
      status: 1,
      remarks: 3, //this is distribution
      quantity: quantity,
      DPT_ID: undistributedItem.DEPARTMENT_ID,
      owner_emp_id: accountable_emp,

      APPROVED_BY: DISTRIBUTED_BY,
    });

    //create notification saying the item is distributed to the employee

    const notificationOwner = await Notification.create({
      MESSAGE: `The ${undistributedItem.ITEM_NAME} has been distributed`,
      FOR_EMP: accountable_emp, //distributed employee
    });

    const newItem: Partial<Item> = await Item.create({
      ITEM_ID,
      quantity,
      ics,
      pis_no,
      acct_code,
      accountable_emp,
      remarks,
      are_no,
      DISTRIBUTED_ON: new Date(),
      DISTRIBUTED_BY,
      status: 1,
      unit_value: undistributedItem.UNIT_VALUE,
      total_value: undistributedItem.UNIT_VALUE * quantity,
      ORIGINAL_QUANTITY: quantity,
      current_dpt_id: undistributedItem.DEPARTMENT_ID,

      //data from undistributed item
      name: undistributedItem.ITEM_NAME,
      description: remarks,
    });

    //saving the quantity
    await undistributedItem.save();

    //receiver of the item distributed
    const ownerSocketId = users.get(accountable_emp);

    //send notification to owner
    request.io.to(ownerSocketId).emit("send-notification", notificationOwner);

    response.status(201).json(newItem);

    // Proceed with adding the item to the database or further processing
  } catch (error) {
    console.error(`\x1b[31m\x1b[1m✖ Unable to add item. - ${error}`);
    response.status(500).json({ message: ` Unable to add item. - ${error}` });
  }
};

export const getItems = async (
  request: express.Request,
  response: express.Response
): Promise<any> => {
  try {
    const items = await Item.findAll({
      where: { deleted: 0 },
      order: [["name", "ASC"]],
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
      include: [
        { model: ItemModel, as: "itemDetails" },
        { model: Employee, as: "distributedByEmpDetails" },
      ],
    });

    res.status(200).json(ownedItems);
  } catch (error) {
    console.error(`Unable to get items - ${error}`);
    res.status(500).json({ message: `Unable to get items. - ${error} ` });
  }
};

//get items not owned
export const getNotOwnedItems = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { empId } = req.params;
  const { departmentId } = req.query;

  if (!empId) return res.status(400).json({ message: "Emp id is required." });
  if (!departmentId)
    return res.status(400).json({ message: "Department id is required." });
  try {
    const items = await Item.findAll({
      where: { accountable_emp: { [Op.ne]: empId }, belong_dpt: departmentId },
      include: [{ model: ItemModel, as: "itemDetails" }],
    });

    res.status(200).json(items);
  } catch (error) {
    console.error("Unexpected error. ", error);
    res.status(500).json({ message: "Unexpected error. ", error });
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
      return res.status(404).json({ message: "Department does not exist" });
    }

    const items = await Item.findAll({
      where: { current_dpt_id: department },
      include: [
        { model: ItemModel, as: "itemDetails" },
        {
          model: Employee,
          as: "accountableEmpDetails",
        },
      ],
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
    const itemFound = await Item.findByPk(itemId, {
      include: [{ model: ItemModel, as: "itemDetails" }],
    });

    if (!itemFound) {
      return res.status(404).json({ message: "Item does not exist." });
    }

    res.status(200).json(itemFound);
  } catch (error) {
    console.error("Unable to get item by id. ", error);
    res.status(500).json({ message: "Unable to get item by id. ", error });
  }
};
