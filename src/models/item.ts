import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import Employee from "./employee.js";
import ItemStatus from "./item_status.js";
import ItemModel from "./itemModel.js";

//mao ni atong item stock
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
    name: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      defaultValue: 0,
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
      allowNull: false,
    },
    belong_dpt: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    distributedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "distributed_items",
    timestamps: true,
  }
);

Item.belongsTo(ItemStatus, {
  foreignKey: "status",
  as: "itemStatusDetails",
});

Item.belongsTo(Employee, {
  foreignKey: "accountable_emp",
  as: "ownerEmpDetails",
});
Item.belongsTo(ItemModel, {
  foreignKey: "ITEM_ID",
  as: "itemDetails",
});

export default Item;
