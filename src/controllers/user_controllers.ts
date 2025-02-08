import express from "express";
import User from "../models/user.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { configDotenv } from "dotenv";
import Employee from "../models/employee.js";
import Roles from "../models/user_type.js";
import { log } from "console";

configDotenv({ path: ".env.local" });

// Adds a new user to the database
export const addUser = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { emp_id, username, email, password, role, departmentId } = req.body;

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
    const [isEmpIDExist, isRoleIDExist, isEmailExist] = await Promise.all([
      //this should be in order
      Employee.count({ where: { ID: emp_id } }),
      Roles.count({ where: { id: role } }),
      User.count({ where: { email } }),
    ]);

    //check emp_id exist
    if (isEmpIDExist === 0) {
      return res
        .status(400)
        .json({ message: "Employee does not register in list of employee." });
    }

    if (isEmailExist >= 1) {
      return res.status(400).json({ message: "Email has already taken." });
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
      current_dpt_id: departmentId,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Unable to add user. - ${error}` });
  }
};

//get all users by department
export const viewUsers = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const departmentId = Number(req.query.departmentId);
  try {
    if (!departmentId) {
      return res
        .status(400)
        .json({ message: "Department id is required to find users." });
    }

    const users = await User.findAll({
      where: { current_dpt_id: departmentId },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(`Unable to view users - ${error}`);
    res.status(500).json({ message: `Unable to view users - ${error}` });
  }
};

//login users
export const login = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  try {
  } catch (error) {
    console.error(`Unable to login - ${error}`);
    res.status(500).json({ message: `Unable to login - ${error}` });
  }
};
