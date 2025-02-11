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

    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    emp_owner: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ics: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    are_no: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    prop_no: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    serial_no: {
      type: DataTypes.STRING(45),
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
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "items",
    timestamps: true,
  }
);

export default Item;
