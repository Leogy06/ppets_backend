import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class Department extends Model {
  public ID!: number;
  public DEPARTMENT_NAME!: string;
  public CODE!: string;
  public DESCRIPTION?: string;
  public OFFICER!: string;
  public POSITION!: string;
  public ENTRY_DATE!: Date;
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
