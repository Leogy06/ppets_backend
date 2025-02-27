import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import Employee from "./employee.js";
import Item from "./distributedItemModel.js";

//mao ni ang distributed item
class ItemModel extends Model {}

ItemModel.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      allowNull: false,
    },
    ITEM_NAME: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    UNIT_VALUE: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    TOTAL_VALUE: {
      type: DataTypes.DECIMAL(10, 2),
    },
    STOCK_QUANTITY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ORIGINAL_STOCK: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RECEIVED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    PROP_NO: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    SERIAL_NO: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    DEPARTMENT_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    REMARKS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DELETE: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "items",
  }
);

export default ItemModel;
