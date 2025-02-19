import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import BorrowingTransaction from "./borrowing_logs.js";

class Employee extends Model {}

//datatypes employee columns
Employee.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_NUMBER: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    FIRSTNAME: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    MIDDLENAME: {
      type: DataTypes.STRING(28),
      allowNull: true,
    },
    LASTNAME: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    SUFFIX: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    DEPARTMENT_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CURRENT_DPT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CREATED_WHEN: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UPDATED_WHEN: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    DELETED: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
  },

  {
    sequelize,
    tableName: "employee",
    timestamps: false,
  }
);

export default Employee;
