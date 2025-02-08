import express from "express";
import User from "../models/user.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { configDotenv } from "dotenv";
import Employee from "../models/employee.js";
import Roles from "../models/role.js";

configDotenv({ path: ".env.local" });

// Adds a new user to the database
export const addUser = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { emp_id, username, email, password, role } = req.body;

  //validating the entered datas.
  const errors = validationResult(req);

  //sends an error if theres invalid data

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));
    const hashedPassword = await bcrypt.hash(password, salt);

    //checking if empl id and role does not exist
    const [isEmpIDExist, isRoleIDExist] = await Promise.all([
      Employee.count({ where: { ID: emp_id } }),
      Roles.count({ where: { id: role } }),
    ]);

    //check emp_id exist
    if (isEmpIDExist === 0) {
      return res
        .status(400)
        .json({ message: "Employee does not register in list of employee." });
    }

    //check if role id exist
    if (isRoleIDExist === 0) {
      return res.status(400).json({ message: "Role id does not exist." });
    }

    const newUser = await User.create({
      emp_id,
      username,
      password: hashedPassword,
      email,
      is_active: 1,
      role,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Unable to add user. - ${error}` });
  }
};
