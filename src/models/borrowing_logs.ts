import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import Item from "./item.js";
import Employee from "./employee.js";

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
      allowNull: false,
    },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    remarks: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  { sequelize, timestamps: true, tableName: "borrowing_transaction" }
);

// Define the association
BorrowingTransaction.belongsTo(Item, {
  foreignKey: "borrowedItem",
  as: "borrowedItemDetails",
});

BorrowingTransaction.belongsTo(Employee, {
  foreignKey: "owner",
  as: "ownerEmp",
});

BorrowingTransaction.belongsTo(Employee, {
  foreignKey: "borrower",
  as: "borrowerEmp",
});

export default BorrowingTransaction;
