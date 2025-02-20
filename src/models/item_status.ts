import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class ItemStatus extends Model {}

ItemStatus.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "item_status_tbl",
  }
);

export default ItemStatus;
