import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
class Item extends Model {}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ics: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    are_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prop_no: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    serial_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category_item: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "items",
    timestamps: true,
  }
);

export default Item;
