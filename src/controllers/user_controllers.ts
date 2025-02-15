import express from "express";
import User from "../models/user.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { configDotenv } from "dotenv";
import Employee from "../models/employee.js";
import Roles from "../models/user_type.js";
import { CustomRequest, generateToken } from "../middlewares/auth.js";
import jwt from "jsonwebtoken";

configDotenv({ path: ".env.local" });

interface UserProps extends User {
  id: number;
  emp_id: number;
  username: string;
  password: string;
  email: string;
  is_active: number;
  role: number;
  current_dpt_id?: number;
  refreshToken?: string;
}

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
    const errorMsg = errors.array().map((err) => ({ messages: err.msg }));
    return res.status(400).json(errorMsg);
  }

  try {
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));
    const hashedPassword = await bcrypt.hash(password, salt);

    //checking if empl id and role does not exist
    const [isEmpIDExist, isRoleIDExist, isEmailExist, isUsernameExist] =
      await Promise.all([
        //this should be in order
        Employee.count({ where: { ID: emp_id } }),
        Roles.count({ where: { id: role } }),
        User.count({ where: { email } }),
        User.count({ where: { username } }),
      ]);

    //check emp_id exist
    //emp id should exist in emp tbl
    if (isEmpIDExist === 0) {
      return res
        .status(400)
        .json({ message: "Employee does not register in list of employee." });
    }

    //email should not duplicated
    if (isEmailExist > 0) {
      return res.status(400).json({ message: "Email has already taken." });
    }

    //check if role id exist
    if (isRoleIDExist === 0) {
      return res.status(400).json({ message: "Role id does not exist." });
    }

    //check if duplicate username
    if (isUsernameExist > 0) {
      return res.status(400).json({ message: "Username has already taken." });
    }

    //creatin new user
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
export const login = async (
  req: CustomRequest,
  res: express.Response
): Promise<any> => {
  const { username, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = (await User.findOne({
      where: { username },
    })) as UserProps | null;

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res
        .status(500)
        .json({ message: "User password is missing in db" });
    }

    const empDetails = await Employee.findByPk(user.emp_id);

    if (!empDetails) {
      return res.status(400).json({ message: "Employee does not exist." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }
    const token = generateToken(user);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //username
    res.cookie("username", user.username, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

    res.cookie("role", user.role, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

    res.status(200).json({
      message: "Login successfully.",
      user,
      empDetails,
    });
  } catch (error) {
    console.error(`Unable to login - ${error}`);
    res.status(500).json({ message: `Unable to login - ${error}` });
  }
};

//logout user
export const logout = async (req: express.Request, res: express.Response) => {
  try {
    //clear token
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    //clear username
    res.clearCookie("username", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    //clear role
    res.clearCookie("role", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Unable to logout. - ${error}` });
  }
};

//check user if still login
export const checkUser = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized access." });
  }
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string
    ) as { id: number };

    const user = (await User.findOne({
      where: { id: decoded.id },
    })) as UserProps | null;

    const empDetails = await Employee.findByPk(user?.emp_id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User is authenticated.",
      user,
      empDetails,
      id: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error(`Unable to check user - ${error}`);
    res.status(500).json({ message: `Unable to check user - ${error}` });
  }
};
