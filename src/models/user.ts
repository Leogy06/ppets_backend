import { DataTypes, Model } from "sequelize";
import sequelize from "../db/config.js";

class User extends Model {
  public ID!: number;
 public ID_NUMBER!:number;

}

//datatypes employee columns
User.init(
 {
  id:{
    type:DataTypes.STRING,
  },
  username:{
    type:DataTypes.STRING,
  },
  password:{
    type:DataTypes.STRING,
  },
  email:{
    type:DataTypes.STRING,
  },
  is_active:{
    type:DataTypes.INTEGER,
  },
  role:{
    type:DataTypes.INTEGER,
  },
  
 },

  {
    sequelize,
    tableName: "users",
    timestamps: false,
  }
);

export default User;
