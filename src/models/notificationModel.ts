import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class Notification extends Model {}

Notification.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    MESSAGE: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    READ: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    FOR_USER: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "notification_tbl",
  }
);

export default Notification;
