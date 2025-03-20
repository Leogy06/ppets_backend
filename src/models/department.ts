import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class Department extends Model {
  declare ID: number;
  declare DEPARTMENT_NAME: string;
  declare CODE: string;
  declare DESCRIPTION: string;
  declare OFFICER: string;
  declare POSITION: string;
  declare ENTRY_DATE: Date;
}

Department.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    DEPARTMENT_NAME: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CODE: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DESCRIPTION: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    OFFICER: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    POSITION: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ENTRY_DATE: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "department_table",
    timestamps: false,
  }
);

export default Department;
