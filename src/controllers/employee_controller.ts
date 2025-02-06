import Department from "../models/department.ts";
import Employee from "../models/employee.ts";
import express from "express";

const { request, response } = express;

//for employee page
export const getEmployees = async (
  req: typeof request,
  res: typeof response
) => {
  try {
    const { department } = req.query;

    const { rows: employees } = await Employee.findAndCountAll({
      where: department ? { DEPARTMENT_ID: department } : {},
    });

    employees.sort((a: any, b: any) =>
      (a.LASTNAME || "").localeCompare(b.LASTNAME || "")
    );

    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error - ${error}` });
  }
};

//add employees
export const addEmployee = async (
  req: typeof request,
  res: typeof response
) => {
  try {
    const {
      ID_NUMBER,
      FIRSTNAME,
      MIDDLENAME,
      LASTNAME,
      SUFFIX,
      DEPARTMENT_ID,
    } = await req.body;

    if (!ID_NUMBER || !FIRSTNAME || !LASTNAME || !DEPARTMENT_ID) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //prevent duplication id number
    const isIDNumberExist = await Employee.findOne({
      where: { ID_NUMBER: ID_NUMBER },
    });

    if (isIDNumberExist) {
      return res.status(400).json({ message: "ID number is duplicated." });
    }

    const department = await Department.findOne({
      where: { ID: DEPARTMENT_ID },
    });

    if (!department) {
      return res.status(400).json({ message: "Department doesn't exist." });
    }

    const newEmployee = await Employee.create({
      ID_NUMBER,
      FIRSTNAME,
      MIDDLENAME,
      LASTNAME,
      SUFFIX,
      DEPARTMENT_ID,
      CURRENT_DEPARTMENT: DEPARTMENT_ID,
      CREATED_BY: 1, //change this when login for admin is ready
      CREATED_WHEN: new Date(),
      UPDATED_WHEN: new Date(),
      UPDATED_BY: 1,
      DELETED: 0,
    });

    res
      .status(201)
      .json({ message: "Employee has been added.", newEmployee, department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Unexpected error occured - ${error}` });
  }
};

//edit employees
export const editEmployee = (req: typeof request, res: typeof response) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Unable to edit employee. - ${error}` });
  }
};
