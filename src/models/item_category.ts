import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class ItemCategory extends Model {}

ItemCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "item_category",
  }
);

export default ItemCategory;
