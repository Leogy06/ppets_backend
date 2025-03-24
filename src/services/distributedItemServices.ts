import { Op, WhereOptions } from "sequelize";
import Item from "../models/distributedItemModel.js";
import ItemModel from "../models/itemModel.js";
import Employee from "../models/employee.js";
import { CustomError } from "../utils/CustomError.js";
import { EmployeeProps, ItemProps, TransactionProps } from "../@types/types.js";
import { add } from "date-fns";
import { logger } from "../logger/logger.js";

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

  //add distributed item service
  async addDistributedItemServices(data: Partial<ItemProps>) {
    // console.log("data ", data);

    data.total_value = Number(data?.unit_value) * Number(data?.quantity);
    data.ORIGINAL_QUANTITY = data.quantity;

    //find in the undistributed item
    const undistributedItem = (await ItemModel.findByPk(data.ITEM_ID)) as any;

    if (!undistributedItem) {
      throw new CustomError("Item does not exist.", 400);
    }

    //check if quantity is enough in the undistributed item
    if (
      undistributedItem.getDataValue("STOCK_QUANTITY") < Number(data?.quantity)
    ) {
      throw new CustomError("Item quantity is not enough.", 400);
    }

    //update quantity in undistributed item
    const newQuantity =
      Number(undistributedItem.getDataValue("STOCK_QUANTITY")) -
      Number(data?.quantity); //subtracting

    undistributedItem.STOCK_QUANTITY = newQuantity;

    const undistributedItemResult = await undistributedItem.save();

    // console.log("undistributedItemResult ", undistributedItemResult);

    return await Item.create(data);
  },

  //get distributed item count
  async getDistributedItemCountService(employeeId: EmployeeProps["ID"]) {
    if (!employeeId) throw new CustomError("Employee id is required.", 400);

    return await Item.count({ where: { accountable_emp: employeeId } });
  },
};

export default distributedItemService;
