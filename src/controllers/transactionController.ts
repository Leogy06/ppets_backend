import express from "express";
import TransactionModel from "../models/transactionModel.js";
import Item from "../models/distributedItemModel.js";
import ItemModel from "../models/itemModel.js";

// api = get /transaction
export const transactionController = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { DPT_ID, TRANSACTION_TYPE } = req.query;

  //check if query params are empty
  if (!DPT_ID || !TRANSACTION_TYPE) {
    return res
      .status(400)
      .json({ message: "Query params are empty. ", DPT_ID, TRANSACTION_TYPE });
  }

  try {
    const transactions = await TransactionModel.findAll({
      where: {
        DPT_ID,
        remarks: TRANSACTION_TYPE,
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Item,
          as: "distributedItemDetails",
          include: [{ model: ItemModel, as: "distributedItemDetails" }],
        },
      ],
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Unable to get transactions. ", error);
  }
};
