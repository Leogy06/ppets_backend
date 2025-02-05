import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../db/config.ts";

class Employee extends Model {
  public id!: string;
  public email!: string;
  public firstName!: string;
  public middleName?: string;
  public lastName!: string;
  public suffix?: string;
}

//datatypes employee columns
Employee.init(
  {
    ID: {
      type: DataTypes.STRING,
    },
    ID_NUMBER: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    FIRSTNAME: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MIDDLENAME: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LASTNAME: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SUFFIX: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    DEPARTMENT_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DETAILED_DEPARTMENT_ID: {
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
  },

  {
    sequelize,
    tableName: "employee",
    timestamps: false,
  }
);

export default Employee;
