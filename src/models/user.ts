import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";
import Employee from "./employee.js";

class User extends Model {
  public ID!: number;
  public empl_id!: number;
  public username!: string;
  public password!: string;
  public email!: string;
  public is_active!: number;
  public role!: number;
}

//datatypes employee columns
User.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    emp_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_dpt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  {
    sequelize,
    tableName: "users",
    timestamps: false,
  }
);

User.belongsTo(Employee, { foreignKey: "emp_id" });
Employee.hasMany(User, { foreignKey: "emp_id" });

export default User;
