import { Op, WhereOptions } from "sequelize";
import TransactionModel from "../models/transactionModel.js";
import Item from "../models/distributedItemModel.js";
import Employee from "../models/employee.js";
import ItemModel from "../models/itemModel.js";
import TransactionRemarks from "../models/btRemarksModel.js";
import TransactionStatusModel from "../models/transactionStatusModel.js";
import { CustomError } from "../utils/CustomError.js";
import { ItemProps, TransactionProps } from "../@types/types.js";
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
    if (!DPT_ID || !LIMIT || !TRANSACTION_TYPE) {
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

    if (!DISTRIBUTED_ITM_ID || !quantity || !owner_emp_id) {
      throw new CustomError("Missing required fields.", 400);
    }

    const [distributedItem, owner] = await Promise.all([
      Item.findByPk(DISTRIBUTED_ITM_ID),
      Employee.findByPk(owner_emp_id),
    ]);

    // Validate existence
    if (!distributedItem || !owner) {
      throw new CustomError("Item or employee not found.", 404);
    }

    //check borrower exists
    if (borrower_emp_id) {
      const borrower = await Employee.findByPk(borrower_emp_id);

      if (!borrower) {
        throw new CustomError("Borrower not found.", 404);
      }

      // Prevent self-borrowing
      if (borrower.getDataValue("ID") === owner.getDataValue("ID")) {
        throw new CustomError("You cannot borrow your own item.", 400);
      }

      if (
        borrower.getDataValue("ID") ===
        distributedItem.getDataValue("accountable_emp_id")
      ) {
        throw new CustomError("You cannot borrow your own item.", 400);
      }
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

    //where transaction
    const whereClause: WhereOptions<any> = {
      DISTRIBUTED_ITM_ID,
      status: 2, // Pending
      remarks, // Borrow or lend
    };

    if (borrower_emp_id) {
      whereClause.borrower_emp_id = borrower_emp_id;
    }

    const existingBorrowTransaction = await TransactionModel.findOne({
      where: whereClause,
    });

    if (existingBorrowTransaction) {
      throw new CustomError(
        "The request has already been made. Still pending...",
        400
      );
    }

    const newTransaction = await TransactionModel.create({
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

    // Create transaction
    return newTransaction;
  },

  //edit transaction
  async editTransactionService(data: Partial<TransactionProps>) {
    const { id } = data;

    logger.info("Editing transaction", data);

    if (!id) {
      throw new CustomError("Missing required fields.", 400);
    }

    const transaction = await TransactionModel.findByPk(id);

    if (!transaction) {
      throw new CustomError("Transaction not found.", 404);
    }

    if (transaction.getDataValue("status") !== 2) {
      throw new CustomError("Transaction status is not pending.", 400);
    }

    //reduce the quantuty in distributed item
    const distributedItem = await Item.findByPk(
      transaction.getDataValue("DISTRIBUTED_ITM_ID")
    );

    if (!distributedItem) {
      throw new CustomError("Item not found.", 404);
    }

    //check if quantity is enough
    if (
      transaction.getDataValue("quantity") >
      distributedItem.getDataValue("quantity")
    ) {
      throw new CustomError("Not enough quantity available.", 400);
    }

    //reduce the quantity
    const newQuantity =
      distributedItem.getDataValue("quantity") -
      transaction.getDataValue("quantity");

    //reducing the quantity
    await Item.update(
      { quantity: newQuantity },
      { where: { id: transaction.getDataValue("DISTRIBUTED_ITM_ID") } }
    );

    //edit transaction
    TransactionModel.update(data, { where: { id } });

    const updatedTransaction = await TransactionModel.findByPk(id);

    if (!updatedTransaction) {
      throw new CustomError("Transaction not found.", 404);
    }

    return updatedTransaction;
  },

  async rejectTransactionService(
    transactionId: Partial<TransactionProps["id"]>
  ) {
    if (!transactionId) {
      throw new CustomError(
        `Missing required fields. id: ${transactionId}`,
        400
      );
    }

    const transaction = await TransactionModel.findByPk(transactionId);

    if (!transaction) {
      throw new CustomError("Transaction not found.", 404);
    }

    //check if transaction is pending
    if (transaction.getDataValue("status") !== 2) {
      throw new CustomError("Transaction status is not pending.", 400);
    }

    //check if already rejected
    if (transaction.getDataValue("status") === 4) {
      throw new CustomError("Transaction is already rejected.", 400);
    }

    //4 - rejected
    return await TransactionModel.update(
      { status: 4 },
      { where: { id: transactionId } }
    );
  },

  async approveTransferTransactionService(
    transactionId: TransactionProps["id"],
    APPROVED_BY: TransactionProps["APPROVED_BY"]
  ) {
    if (!transactionId) {
      throw new CustomError("Missing required fields.", 400);
    }

    const transaction = await TransactionModel.findByPk(transactionId);

    if (!transaction) {
      throw new CustomError("Transaction not found.", 404);
    }

    //throw erro if transaction is already rejects
    if (transaction.getDataValue("status") === 4) {
      throw new CustomError("Transaction is already rejected.", 400);
    }

    //check if transaction is pending
    if (transaction.getDataValue("status") !== 2) {
      throw new CustomError("Transaction status is not pending.", 400);
    }

    //check if the remarks is transfer
    // 4- transfer
    if (transaction.getDataValue("remarks") !== 4) {
      throw new CustomError("Transaction is not for transfer.", 400);
    }

    //find the item in distributed item
    const distributedItem = (await Item.findByPk(
      transaction.getDataValue("DISTRIBUTED_ITM_ID")
    )) as ItemProps;

    //check if distributed item exist in the database
    if (!distributedItem) {
      throw new CustomError("Distributed item not found.", 404);
    }

    //check if quantity is enough
    if (
      transaction.getDataValue("quantity") >
      distributedItem.getDataValue("quantity")
    ) {
      //reject automatically sinces it is lack in quantity
      await TransactionModel.update(
        { status: 4 },
        { where: { id: transactionId } }
      );
      throw new CustomError(
        "Not enough quantity available. Transaction rejected.",
        400
      );
    }

    //reduce the quantity
    const newQuantity =
      distributedItem.getDataValue("quantity") -
      transaction.getDataValue("quantity");

    //reduce the original quantity
    const newOriginalQuantity =
      distributedItem.ORIGINAL_QUANTITY - transaction.getDataValue("quantity");

    //reducing the quantities
    distributedItem.quantity = newQuantity;
    distributedItem.ORIGINAL_QUANTITY = newOriginalQuantity;

    //update the transaction
    transaction.status = 1; //approved, from pending
    transaction.APPROVED_BY = APPROVED_BY; //change the approve by

    //save the lendee item
    await distributedItem.save();
    //save the transaction
    await transaction.save();

    //transfering the quantity
    //create new distributed item
    await Item.create({
      ITEM_ID: transaction.getDataValue("distributed_item_id"), //make sure this is from undistributed item, even the name of this is distributed item
      quantity: transaction.getDataValue("quantity"),
      ORIGINAL_QUANTITY: transaction.getDataValue("quantity"),
      unit_value: distributedItem.getDataValue("unit_value"),
      //accountable employee is from transaction borrower
      accountable_emp: transaction.getDataValue("borrower_emp_id"),
      total_value:
        distributedItem.getDataValue("unit_value") *
        transaction.getDataValue("quantity"),
      status: 1,
      current_dpt_id: transaction.getDataValue("DPT_ID"),
      added_by: transaction.APPROVED_BY,
      distributedAt: new Date(),
      DISTRIBUTED_BY: transaction.APPROVED_BY,
    });

    return transaction;
  },

  //approve return transaction
  async approveReturnTransactionService(
    transactionId: TransactionProps["id"],
    APPROVED_BY: TransactionProps["APPROVED_BY"]
  ) {
    if (!transactionId) {
      throw new CustomError("Missing required fields.", 400);
    }

    if (!APPROVED_BY) {
      throw new CustomError("Missing required fields.", 400);
    }

    //find the transaction
    const transaction = await TransactionModel.findByPk(transactionId);

    if (!transaction) {
      throw new CustomError("Transaction not found.", 404);
    }

    //check if transaction is pending
    if (transaction.getDataValue("status") !== 2) {
      throw new CustomError("Transaction status is not pending.", 400);
    }

    //check if the remarks is return
    // 5- return
    if (transaction.getDataValue("remarks") !== 5) {
      throw new CustomError("Transaction is not for return.", 400);
    }

    //find the item in distributed item
    const distributedItem = (await Item.findByPk(
      transaction.getDataValue("DISTRIBUTED_ITM_ID")
    )) as ItemProps;

    //check if distributed item exist in the database
    if (!distributedItem) {
      throw new CustomError("Distributed item not found.", 404);
    }

    distributedItem.quantity = +transaction.getDataValue("quantity");

    if (distributedItem.quantity >= distributedItem.ORIGINAL_QUANTITY) {
      throw new CustomError("Quantity is greater than original quantity.", 400);
    }

    //update the transaction
    transaction.status = 1; //approved, from pending
    transaction.APPROVED_BY = APPROVED_BY; //change the approve by

    //save the lendee item
    await distributedItem.save();
    //save the transaction
    await transaction.save();

    return transaction;
  },

  //get transaction count base on type
  async getTransactionCountService(
    remarks: TransactionProps["remarks"] | undefined,
    DPT_ID: TransactionProps["DPT_ID"]
  ) {
    if (!DPT_ID) throw new CustomError("Missing required fields.", 400);

    const where: WhereOptions<TransactionProps> = { DPT_ID };
    if (remarks) where.remarks = remarks;

    const count = await TransactionModel.count({ where });
    return count;
  },

  //get transaciton tpday
  async getTransactionCountTodayService(DPT_ID: TransactionProps["DPT_ID"]) {
    if (!DPT_ID)
      throw new CustomError(
        "Missing required fields. This error is from getTransactionCountTodayService",
        400
      );

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const where: WhereOptions<TransactionProps> = {
      DPT_ID,
      createdAt: { [Op.between]: [startOfDay, endOfDay] },
    };

    const transactions = await TransactionModel.count({ where });

    return transactions;
  },
};

export default transactionServices;
