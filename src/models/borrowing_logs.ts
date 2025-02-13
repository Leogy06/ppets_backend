import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class BorrowingLogs extends Model {}

BorrowingLogs.init(
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
    remarks: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  { sequelize, timestamps: true, tableName: "borrowing_logs" }
);

export default BorrowingLogs;
