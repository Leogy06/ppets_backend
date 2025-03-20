import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import Employee from "./employee.js";
import Department from "./department.js";
import BorrowingStatus from "./transactionStatusModel.js";
import Item from "./distributedItemModel.js";
import TransactionRemarks from "./btRemarksModel.js";

class TransactionModel extends Model {
  declare id: number;
  declare distributed_item_id: number;
  declare borrower_emp_id: number;
  declare owner_emp_id: number;
  declare quantity: number;
  declare status: number;
  declare DPT_ID: number;
  declare remarks: number;
  declare APPROVED_BY: number;
  declare RECEIVED_BY: number;
  declare TRANSACTION_DESCRIPTION: string;
  declare DISTRIBUTED_ITM_ID: number;
}

TransactionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    distributed_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    DISTRIBUTED_ITM_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    borrower_emp_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    owner_emp_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    DPT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    APPROVED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },

    RECEIVED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    TRANSACTION_DESCRIPTION: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: null,
    },
  },
  { sequelize, timestamps: true, tableName: "borrowing_transaction" }
);

// Define the association
TransactionModel.belongsTo(Item, {
  foreignKey: "distributed_item_id",
  as: "distributedItemDetails",
});

TransactionModel.belongsTo(Employee, {
  foreignKey: "owner_emp_id",
  as: "ownerEmp",
});

//approved by
TransactionModel.belongsTo(Employee, {
  foreignKey: "APPROVED_BY",
  as: "approvedByEmpDetails",
});

TransactionModel.belongsTo(Employee, {
  foreignKey: "borrower_emp_id",
  as: "borrowerEmp",
});

//borrow to department
TransactionModel.belongsTo(Department, {
  foreignKey: "DPT_ID",
  as: "departmentDetails",
});

//status
//borrow to department
TransactionModel.belongsTo(BorrowingStatus, {
  foreignKey: "status",
  as: "statusDetails",
});

TransactionModel.belongsTo(TransactionRemarks, {
  foreignKey: "remarks",
  as: "transactionRemarksDetails",
});

//distributed item

export default TransactionModel;
