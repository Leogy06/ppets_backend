import express from "express";
import Department from "../models/department.ts";
import Employee from "../models/employee.ts";

//employee type
interface EmployeeProps {
  ID: number;
  ID_NUMBER: number;
  FIRSTNAME: string;
  MIDDLENAME?: string;
  LASTNAME: string;
  SUFFIX?: string;
  DEPARTMENT_ID?: number;
  CURRENT_DEPARTMENT?: number;
  CREATED_BY?: number;
  CREATED_WHEN?: Date;
  DELETED?: number;
}

//for employee page
export const getEmployees = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
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
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    const {
      ID_NUMBER,
      FIRSTNAME,
      MIDDLENAME,
      LASTNAME,
      SUFFIX,
      DEPARTMENT_ID,
    } = req.body;

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
export const editEmployee = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { ID } = req.query;
  const {
    ID_NUMBER,
    FIRSTNAME,
    MIDDLENAME,
    LASTNAME,
    SUFFIX,
    DEPARTMENT_ID,
    CURRENT_DEPARTMENT,
    CREATED_BY,
    CREATED_WHEN,
    DELETED,
  } = req.body;
  try {
    if (!ID) {
      return res.status(500).json({ message: "ID is empty." });
    }

    const employee = await Employee.findOne({ where: { ID } });

    if (!employee) {
      return res.status(400).json({ message: "Employee doesn't exist." });
    }

    const editEntries: Partial<EmployeeProps> = {};

    if (ID_NUMBER) {
      editEntries.ID_NUMBER = ID_NUMBER;
    }
    if (FIRSTNAME) {
      editEntries.FIRSTNAME = FIRSTNAME;
    }
    if (MIDDLENAME) {
      editEntries.MIDDLENAME = MIDDLENAME;
    }
    if (LASTNAME) {
      editEntries.LASTNAME = LASTNAME;
    }
    if (SUFFIX) {
      editEntries.SUFFIX = SUFFIX;
    }
    if (DEPARTMENT_ID) {
      editEntries.DEPARTMENT_ID = DEPARTMENT_ID;
    }
    if (CURRENT_DEPARTMENT) {
      editEntries.CURRENT_DEPARTMENT = CURRENT_DEPARTMENT;
    }
    if (CREATED_BY) {
      editEntries.CREATED_BY = CREATED_BY;
    }
    if (CREATED_WHEN) {
      editEntries.CREATED_WHEN = CREATED_WHEN;
    }
    if (DELETED !== undefined) {
      editEntries.DELETED = DELETED;
    }

    const updatedEmpl = await Employee.update(editEntries, { where: { ID } });

    res.status(200).json({
      message: "Employee has been updated.",
      updatedEmpl,
      editEntries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Unable to edit employee. - ${error}` });
  }
};
