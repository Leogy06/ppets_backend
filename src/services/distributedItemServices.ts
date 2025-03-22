import { Op, WhereOptions } from "sequelize";
import Item from "../models/distributedItemModel.js";
import ItemModel from "../models/itemModel.js";
import Employee from "../models/employee.js";
import { CustomError } from "../utils/CustomError.js";
import { TransactionProps } from "../@types/types.js";

interface DistributedItemService {
  department: TransactionProps["DPT_ID"];
  limit: number;
  owner_emp_id?: TransactionProps["owner_emp_id"];
}

const distributedItemService = {
  async getDistributedItems({
    department,
    limit,
    owner_emp_id: accountable_emp,
  }: DistributedItemService) {
    const whereClause: WhereOptions<any> = {};
    const whereNotOwned: WhereOptions<any> = {};

    if (department) {
      whereClause.current_dpt_id = department;
      whereNotOwned.current_dpt_id = department;
    }

    if (accountable_emp) {
      whereClause.accountable_emp = accountable_emp;
      whereNotOwned.accountable_emp = { [Op.ne]: accountable_emp };
    }

    const ownedItems = await Item.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      include: [
        {
          model: ItemModel,
          as: "undistributedItemDetails",
        },
        {
          model: Employee,
          as: "accountableEmpDetails",
        },
      ],
    });

    const notOwnedItems = await Item.findAll({
      where: whereNotOwned,
      order: [["createdAt", "DESC"]],
      limit,
      include: [
        {
          model: ItemModel,
          as: "undistributedItemDetails",
        },
        {
          model: Employee,
          as: "accountableEmpDetails",
        },
      ],
    });

    return { ownedItems, notOwnedItems };
  },

  async getDistributedItemByIdService(itemId: number) {
    if (!itemId) throw new CustomError("Item id is required.", 400);

    return await Item.findByPk(itemId, {
      include: [{ model: ItemModel, as: "undistributedItemDetails" }],
    });
  },
};

export default distributedItemService;
