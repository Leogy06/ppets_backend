import Item from "../models/distributedItemModel.js";
import ItemModel from "../models/itemModel.js";

const distributedItemService = {
  async getItemsByDepartment(department: number, limit: number) {
    return await Item.findAll({
      where: {
        current_dpt_id: department,
      },
      order: [["createdAt", "DESC"]],
      limit,
      include: {
        model: ItemModel,
        as: "undistributedItemDetails",
      },
    });
  },
};

export default distributedItemService;
