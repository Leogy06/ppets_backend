import User from "../models/user.js";
import distributedItemService from "../services/distributedItemServices.js";
import notificationServices from "../services/notifcationServices.js";
import transactionServices from "../services/transactionServices.js";
import { users } from "../sockets/socketManager.js";
import { handleServerError } from "../utils/errorHandler.js";
import { Request, Response } from "express";

// get - /items/distributed_items
export const getDistributedItems = async (req: Request, res: Response) => {
  const { department, limit, owner_emp_id } = req.query;

  try {
    const distributedItems = await distributedItemService.getDistributedItems({
      department: Number(department),
      limit: Number(limit),
      owner_emp_id: Number(owner_emp_id),
    });

    res.status(200).json(distributedItems);
  } catch (error) {
    handleServerError(res, error, "Unable to get items.");
  }
};

export const getItemByIdController = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  try {
    const item = await distributedItemService.getDistributedItemByIdService(
      Number(itemId)
    );

    res.status(200).json(item);
  } catch (error) {
    handleServerError(res, error, "Unable to get item.");
  }
};

//add distributed item
export const addDistributedItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const newItem = await distributedItemService.addDistributedItemServices(
      req.body
    );

    //create transaction for distributed item
    const newTransaction = await transactionServices.createTransactionService({
      DISTRIBUTED_ITM_ID: newItem.getDataValue("id"),
      quantity: newItem.getDataValue("quantity"),
      owner_emp_id: newItem.getDataValue("accountable_emp"),
      TRANSACTION_DESCRIPTION: "Distributed Item",
      status: 1,
      remarks: 3, //distribution
    });

    await notificationServices.createTransactionNotificationService(
      newTransaction.getDataValue("id")
    );

    res.status(201).json(newItem);
  } catch (error) {
    handleServerError(res, error, "Unable to add item.");
  }
};

//get distributed item count by employe id
export const getDistributedItemsCountController = async (
  req: Request,
  res: Response
) => {
  const { employeeId } = req.query;
  try {
    const distributedItemCount =
      await distributedItemService.getDistributedItemCountService(
        Number(employeeId)
      );
    res.status(200).json(distributedItemCount);
  } catch (error) {
    handleServerError(res, error, "Unable to get distributed item count.");
  }
};

export const getDistributedItemsByEmpIdCountController = async (
  req: Request,
  res: Response
) => {
  const { employeeId } = req.query;
  try {
    const distributedItemCount =
      await distributedItemService.getItemsCountByEmpIdService(
        Number(employeeId)
      );

    res.status(200).json(distributedItemCount);
  } catch (error) {
    handleServerError(res, error, "Unable to get distributed item count.");
  }
};
