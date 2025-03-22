import { Op, WhereOptions } from "sequelize";
import Item from "../models/distributedItemModel.js";
import ItemModel from "../models/itemModel.js";
import Employee from "../models/employee.js";
import { CustomError } from "../utils/CustomError.js";

interface DistributedItemService {
  department: number;
  limit: number;
  owner_emp_id?: number;
}

const distributedItemService = {
  async getItemsByDepartment({
    department,
    limit,
    owner_emp_id,
  }: DistributedItemService) {
    const whereClause: WhereOptions<any> = {};

    if (department) whereClause.current_dpt_id = department;

    if (owner_emp_id) whereClause.accountable_emp = owner_emp_id;

    return await Item.findAll({
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
  },

  async getDistributedItemByIdService(itemId: number) {
    if (!itemId) throw new CustomError("Item id is required.", 400);

    return await Item.findByPk(itemId, {
      include: [{ model: ItemModel, as: "undistributedItemDetails" }],
    });
  },
};

export default distributedItemService;
