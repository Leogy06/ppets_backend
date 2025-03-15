import express from "express";
import AccountItem from "../models/accountItemModel.js";

export const getAccountItems = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const accountItems = await AccountItem.findAll();

    res.status(200).json(accountItems);
  } catch (error) {
    console.error("Unable to get account items. ", error);
    res;
  }
};
