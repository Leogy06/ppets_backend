import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class User_type extends Model {
  public id!: number;
  public description!: string;
}

User_type.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "user_type",
    timestamps: false,
  }
);

export default User_type;
