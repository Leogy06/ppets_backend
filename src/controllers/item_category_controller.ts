import express from "express";
import ItemCategory from "../models/item_category.js";
import { ItemCategoryProps } from "../@types/types.js";

export const addCategoryItem = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const { description } = req.body;

  try {
    if (!description) {
      return res.status(400).json({ message: "Description is required." });
    }

    const newItemCategory = await ItemCategory.create({ description });

    res.status(201).json(newItemCategory);
  } catch (error) {
    console.error(`Unable to add item category - ${error}`);
    res.status(500).json({ message: `Unable to add item category - ${error}` });
  }
};

export const getCategoryItems = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    const itemCategories = await ItemCategory.findAll();

    res.status(200).json(itemCategories);
  } catch (error) {
    console.error(`Unable to get item categories - ${error}`);
    res
      .status(500)
      .json({ message: `Unable to get item categories - ${error}` });
  }
};

export const editCategoryItems = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { itemCatId } = req.params;
  const { description } = req.body;
  if (!itemCatId) {
    return res.status(400).json({ message: "Item category ID is required." });
  }

  try {
    const isItemCategoryExist = (await ItemCategory.findByPk(
      itemCatId
    )) as ItemCategoryProps;

    if (!isItemCategoryExist) {
      return res.status(400).json({ message: "Item category does not exist." });
    }

    if (isItemCategoryExist) {
      isItemCategoryExist.description = description;
    }

    isItemCategoryExist.createdAt = new Date();

    await isItemCategoryExist.save();

    res.status(200).send({ message: "Item  category updated successfully." });
  } catch (error) {
    console.error("Unable to edit item category. ", error);
    res.status(500).json({ message: "Unable to edit item category", error });
  }
};
