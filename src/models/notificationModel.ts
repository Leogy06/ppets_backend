import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import BorrowingTransaction from "./transactionModel.js";
import Employee from "./employee.js";
import ItemModel from "./itemModel.js";

class NotificationModel extends Model {
  public ID!: number;
  public READ!: number;
  public TRANSACTION_ID!: number;
  public TRANSACTION!: number;
  public ITEM_ID!: number;
  public QUANTITY!: number;
  public REQUEST_STATUS!: number;
  public OWNER_ID!: number;
  public BORROWER_ID!: number;
}

NotificationModel.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    READ: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    TRANSACTION_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TRANSACTION: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ITEM_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QUANTITY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    REQUEST_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    OWNER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    BORROWER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ADMIN_ID: {
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

NotificationModel.belongsTo(BorrowingTransaction, {
  foreignKey: "TRANSACTION_ID",
  as: "borrowingTransactionDetails",
});

//borrower
NotificationModel.belongsTo(Employee, {
  foreignKey: "BORROWER_ID",
  as: "borrowerEmpDetails",
});

//owner
NotificationModel.belongsTo(Employee, {
  foreignKey: "OWNER_ID",
  as: "ownerEmpDetails",
});

//item
NotificationModel.belongsTo(ItemModel, {
  foreignKey: "ITEM_ID",
  as: "itemDetails",
});

export default NotificationModel;
