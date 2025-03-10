import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import ItemModel from "./itemModel.js";
import Employee from "./employee.js";

//mao ni distributed item
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
    ITEM_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
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
    pis_no: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    class_no: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    acct_code: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    unit_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    accountable_emp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_value: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    deleted: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    current_dpt_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DISTRIBUTED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DISTRIBUTED_ON: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    ORIGINAL_QUANTITY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "distributed_items",
    timestamps: true,
  }
);

Item.belongsTo(ItemModel, {
  foreignKey: "ITEM_ID",
  as: "itemDetails",
});

Item.belongsTo(Employee, {
  foreignKey: "accountable_emp",
  as: "accountableEmpDetails",
});

Item.belongsTo(Employee, {
  foreignKey: "DISTRIBUTED_BY",
  as: "distributedByEmpDetails",
});

export default Item;
