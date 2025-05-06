import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import AccountItem from "./accountItemModel.js";

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
    ORIGINAL_QUANTITY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RECEIVED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    PIS_NO: {
      type: DataTypes.STRING(45),
      allowNull: true,
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
    PAR_NO: {
      type: DataTypes.STRING(45),
      allowNull: true,
      unique: true,
    },
    MR_NO: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    ACCOUNT_CODE: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
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
    ADDED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ICS_NO: {
      type: DataTypes.STRING(45),
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "items",
  }
);

ItemModel.belongsTo(AccountItem, {
  foreignKey: "ACCOUNT_CODE",
  as: "accountCodeDetails",
});

export default ItemModel;
