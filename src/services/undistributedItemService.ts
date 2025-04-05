import AccountItem from "../models/accountItemModel.js";
import ItemModel from "../models/itemModel.js";
import { CustomError } from "../utils/CustomError.js";

//Get undistributed items props
interface UndistributedItemServiceProps {
  limit: number;
  department: number;
}

const undistributedItemServices = {
  async getUndistributedItemServices({
    limit,
    department,
  }: UndistributedItemServiceProps) {
    if (!department) throw new CustomError("Department id is required.", 400);
    if (!limit) throw new CustomError("Limit is required.", 400);

    return await ItemModel.findAll({
      where: { DEPARTMENT_ID: department },
      order: [["createdAt", "DESC"]],
      limit,
      include: [{ model: AccountItem, as: "accountCodeDetails" }],
    });
  },

  //get items count
  async getUndistributedItemCountService(department: number) {
    if (!department) throw new CustomError("Department id is required.", 400);

    return await ItemModel.count({ where: { DEPARTMENT_ID: department } });
  },
};

export default undistributedItemServices;
