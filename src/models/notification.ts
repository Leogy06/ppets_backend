import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class Notification extends Model {}

Notification.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true,
    },
    MESSAGE: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    IS_READ: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    BORROW_TRANSC_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SENDING_USER: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "notification_table",
  }
);

export default Notification;
