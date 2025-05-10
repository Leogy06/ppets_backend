import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class AccountItem extends Model {}

AccountItem.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    ACCOUNT_CODE: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    ACCOUNT_TITLE: {
      type: DataTypes.STRING(90),
      allowNull: false,
    },
    DELETED: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "account_item_tbl",
    timestamps: true,
  }
);

export default AccountItem;
