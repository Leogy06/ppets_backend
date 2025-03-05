import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import Employee from "./employee.js";
import Department from "./department.js";
import BorrowingStatus from "./transactionStatusModel.js";
import ItemModel from "./itemModel.js";

class BorrowingTransaction extends Model {}

BorrowingTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    borrowedItem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    borrower: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    DPT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    RECEIVED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  { sequelize, timestamps: true, tableName: "borrowing_transaction" }
);

// Define the association
BorrowingTransaction.belongsTo(ItemModel, {
  foreignKey: "borrowedItem",
  as: "itemDetails",
});

BorrowingTransaction.belongsTo(Employee, {
  foreignKey: "owner",
  as: "ownerEmp",
});

BorrowingTransaction.belongsTo(Employee, {
  foreignKey: "borrower",
  as: "borrowerEmp",
});

//borrow to department
BorrowingTransaction.belongsTo(Department, {
  foreignKey: "DPT_ID",
  as: "departmentDetails",
});

//status
//borrow to department
BorrowingTransaction.belongsTo(BorrowingStatus, {
  foreignKey: "status",
  as: "statusDetails",
});

//distributed item

export default BorrowingTransaction;
