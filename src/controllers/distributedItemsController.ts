import distributedItemService from "../services/distributedItemServices.js";
import { handleServerError } from "../utils/errorHandler.js";
import express from "express";

// get - /items/distributed_items
export const getDistributedItems = async (
  req: express.Request,
  res: express.Response
) => {
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

export const getItemByIdController = async (
  req: express.Request,
  res: express.Response
) => {
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
