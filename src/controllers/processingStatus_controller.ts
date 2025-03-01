import express from "express";
import BorrowingStatus from "../models/transactionStatusModel.js";

export const getProcessingStatus = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await BorrowingStatus.findAll();

    res.status(200).json(result);
  } catch (error) {
    console.error("Unable to get processing status. ", error);
    res
      .status(500)
      .json({ message: "Unable to get processing status. ", error });
  }
};

export const insertProcessingStatus = async (
  req: express.Request,
  res: express.Response
) => {
  const { description } = req.body;
  try {
    if (!description) {
      res.status(400).json({ message: "Required fields are missing." });
      return;
    }

    const result = await BorrowingStatus.create({ description });

    res.status(201).json(result);
  } catch (error) {
    console.error("Unable to insert processing status. ", error);
    res
      .status(500)
      .json({ message: "Unable to insert process status. ", error });
  }
};
