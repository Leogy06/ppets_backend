import { Op, WhereOptions } from "sequelize";
import TransactionModel from "../models/transactionModel.js";
import Item from "../models/distributedItemModel.js";
import Employee from "../models/employee.js";
import ItemModel from "../models/itemModel.js";
import TransactionRemarks from "../models/btRemarksModel.js";
import TransactionStatusModel from "../models/transactionStatusModel.js";
import { CustomError } from "../utils/CustomError.js";
import { TransactionProps } from "../@types/types.js";
import { logger } from "../logger/logger.js";

//creating borrow transaction interface

//transaction services
const transactionServices = {
  //get transactions
  async getTransactions(
    DPT_ID: number,
    EMP_ID: number,
    LIMIT: number,
    TRANSACTION_TYPE: number
  ) {
    if (!DPT_ID || !EMP_ID || !LIMIT || !TRANSACTION_TYPE) {
      throw new CustomError("Query params are empty.", 400);
    }

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
        { model: TransactionStatusModel, as: "transactionStatusDetails" },
        { model: TransactionRemarks, as: "transactionRemarksDetails" },
      ],
    });
  },

  //create borrowing transaction services
  async createTransactionService(data: Partial<TransactionProps>) {
    const {
      DISTRIBUTED_ITM_ID,
      quantity,
      borrower_emp_id,
      owner_emp_id,
      TRANSACTION_DESCRIPTION,
      status,
      remarks,
    } = data;

    if (!DISTRIBUTED_ITM_ID || !quantity || !borrower_emp_id || !owner_emp_id) {
      throw new CustomError("Missing required fields.", 400);
    }

    const [distributedItem, borrowee, owner] = await Promise.all([
      Item.findByPk(DISTRIBUTED_ITM_ID),
      Employee.findByPk(borrower_emp_id),
      Employee.findByPk(owner_emp_id),
    ]);

    // Validate existence
    if (!distributedItem || !borrowee || !owner) {
      throw new CustomError("Item or employee not found.", 404);
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new CustomError(
        `Quantity must be greater than 0. ${quantity}`,
        400
      );
    }

    if (quantity > distributedItem.getDataValue("quantity")) {
      throw new CustomError("Not enough quantity available.", 400);
    }

    // Prevent self-borrowing
    if (borrowee.getDataValue("ID") === owner.getDataValue("ID")) {
      throw new CustomError("You cannot borrow your own item.", 400);
    }

    if (
      borrowee.getDataValue("ID") ===
      distributedItem.getDataValue("accountable_emp_id")
    ) {
      throw new CustomError("You cannot borrow your own item.", 400);
    }

    // Check if this item has already up for request but not yet approved
    const existingBorrowTransaction = await TransactionModel.findOne({
      where: {
        DISTRIBUTED_ITM_ID,
        borrower_emp_id,
        status: 2, // Pending
        remarks, // Borrow or lend
      },
    });

    if (existingBorrowTransaction) {
      throw new CustomError(
        "You are already requested this item. Still pending...",
        400
      );
    }

    // Create transaction
    return await TransactionModel.create({
      DISTRIBUTED_ITM_ID,
      distributed_item_id: distributedItem.get("ITEM_ID"),
      borrower_emp_id,
      owner_emp_id,
      quantity,
      status,
      remarks,
      TRANSACTION_DESCRIPTION,
      DPT_ID: distributedItem.get("current_dpt_id"),
    });
  },
};

export default transactionServices;
