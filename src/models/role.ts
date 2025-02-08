import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class Roles extends Model {
  public id!: number;
  public description!: string;
}

Roles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: false,
  }
);

export default Roles;
