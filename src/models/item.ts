import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import Employee from "./employee.js";
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
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
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
    serial_no: {
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
      allowNull: true,
    },
    total_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    //item status
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    //category of the item
    category_item: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    //check if deleted
    deleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },

    //who admin added
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "items",
    timestamps: true,
  }
);

Item.belongsTo(Employee, {
  foreignKey: "accountable_emp",
  as: "itemCustodian",
});

export default Item;
