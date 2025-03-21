import { Op, WhereOptions } from "sequelize";
import TransactionModel from "../models/transactionModel.js";
import Item from "../models/distributedItemModel.js";
import Employee from "../models/employee.js";
import ItemModel from "../models/itemModel.js";

//transaction services
const transactionServices = {
  //get transactions
  async getTransactions(
    DPT_ID: number,
    EMP_ID: number,
    LIMIT: number,
    TRANSACTION_TYPE: number
  ) {
    // Define the where clause using Sequelize's WhereOptions type
    const whereClause: WhereOptions<any> = {};

    if (DPT_ID) whereClause.DPT_ID = Number(DPT_ID);
    if (TRANSACTION_TYPE) whereClause.remarks = Number(TRANSACTION_TYPE);

    // Filter by EMP_ID if provided, checking both owner_emp_id and borrower_emp_id
    if (EMP_ID) {
      Object.assign(whereClause, {
        [Op.or]: [{ owner_emp_id: EMP_ID }, { borrower_emp_id: EMP_ID }],
      });
    }
    return await TransactionModel.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: LIMIT,
      include: [
        {
          model: Item,
          as: "distributedItemDetails",
          include: [{ model: ItemModel, as: "undistributedItemDetails" }],
        },
        { model: Employee, as: "borrowerEmpDetails" },
        { model: Employee, as: "ownerEmpDetails" },
      ],
    });
  },
};

export default transactionServices;
