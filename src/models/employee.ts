import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../db/config.js";

class Employee extends Model {
  public ID!: number;
  public ID_NUMBER!: number;
  public FIRSTNAME!: string;
  public MIDDLENAME?: string;
  public LASTNAME!: string;
  public SUFFIX?: string;

  public DEPARTMENT_ID?: number;
  public CURRENT_DPT_ID?: number;
  public CREATED_BY?: number;
  public CREATED_WHEN?: Date;
  public DELETED?: number;
}

//datatypes employee columns
Employee.init(
  {
    ID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
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
