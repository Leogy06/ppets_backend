import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class TransactionRemarks extends Model {}

TransactionRemarks.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "bt_remarks_table",
    timestamps: false,
  }
);

export default TransactionRemarks;
