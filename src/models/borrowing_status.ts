import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class BorrowingStatus extends Model {}

BorrowingStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "processing_status",
  }
);

export default BorrowingStatus;
