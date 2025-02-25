import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import Employee from "./employee.js";
import Item from "./item.js";

//mao ni ang distributed item
class ItemModel extends Model {}

ItemModel.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      allowNull: false,
    },
    ITEM_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ITEM_RECIEVER: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ITEM_QUANTITY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DISTRIBUTED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    DISTRIBUTED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "items",
  }
);

ItemModel.belongsTo(Item, {
  foreignKey: "ITEM_ID",
  as: "itemDetails",
});

ItemModel.belongsTo(Employee, {
  foreignKey: "ITEM_RECIEVER",
  as: "empReceiverDetails",
});
ItemModel.belongsTo(Employee, {
  foreignKey: "DISTRIBUTED_BY",
  as: "empDistributorDetails",
});

export default ItemModel;
