import express from "express";
import Department from "../models/department.js";
import Employee from "../models/employee.js";
import { Op } from "sequelize";
import { EmployeeProps } from "../@types/types.js";

//for employee page
//get employee by department
export const getEmployees = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { department } = req.query;

  if (!department) {
    return res
      .status(400)
      .json({ message: "Department ID is required to find all employees." });
  }

  try {
    const { rows: employees } = await Employee.findAndCountAll({
      where: department
        ? { DEPARTMENT_ID: department, DELETED: { [Op.or]: [0, null] } }
        : { DELETED: { [Op.or]: [0, null] } },
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
      CREATED_BY,
      UPDATED_BY,
    } = req.body;

    if (
      !ID_NUMBER ||
      !FIRSTNAME ||
      !LASTNAME ||
      !DEPARTMENT_ID ||
      !CREATED_BY ||
      !UPDATED_BY
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (ID_NUMBER && String(ID_NUMBER).length < 5) {
      // Do something if ID_NUMBER has at least 5 characters
      return res
        .status(400)
        .json({ message: "ID number digits should be atleast 5." });
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
      CURRENT_DPT_ID: DEPARTMENT_ID,
      CREATED_BY,
      CREATED_WHEN: new Date(),
      UPDATED_WHEN: new Date(),
      UPDATED_BY,
      DELETED: 0,
    });

    res.status(201).json({ message: "Employee has been added.", newEmployee });
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
    CURRENT_DPT_ID,
    DELETED,
    UPDATED_BY,
  } = req.body;

  console.log({ UPDATED_BY });

  try {
    if (!ID) {
      return res.status(500).json({ message: "ID is empty." });
    }

    //check if theres employee in that id
    const employee = await Employee.findOne({ where: { ID } });

    if (!employee || !UPDATED_BY) {
      return res
        .status(400)
        .json({ message: "Missing required fields doesn't" });
    }

    //check if new id number is duplicated
    if (ID_NUMBER) {
      const isIDExist = await Employee.findOne({
        where: { ID_NUMBER, ID: { [Op.ne]: ID } },
      });
      if (isIDExist) {
        return res
          .status(400)
          .json({ message: "ID number has already taken." });
      }
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
    if (CURRENT_DPT_ID) {
      editEntries.CURRENT_DPT_ID = CURRENT_DPT_ID;
    }

    if (DELETED !== undefined) {
      editEntries.DELETED = DELETED;
    }

    //default values
    editEntries.UPDATED_WHEN = new Date();
    editEntries.UPDATED_BY = UPDATED_BY; // change this into dynamic

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

//delete but set empoyee delete to 1

export const deleteEmployee = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { DELETED } = req.query;
  const { IDs } = req.body;

  try {
    if (!IDs) {
      return res.status(400).json({ message: "No ID has been sent." });
    }

    const deleteStatus = Number(DELETED);

    if (DELETED === undefined || DELETED === null || isNaN(deleteStatus)) {
      return res.status(400).json({ message: "Invalid delete value." });
    }

    const emplIds = Array.isArray(IDs) ? IDs : [IDs];

    const emplExist = await Employee.findAll({
      where: { ID: { [Op.in]: emplIds } },
    });

    if (!emplExist) {
      return res
        .status(400)
        .json({ message: "Unable to edit. - Employee doesn't exist." });
    }

    if (!emplExist.length) {
      return res.status(400).json({
        message: "Unable to change delete status. - Employees do not exist.",
      });
    }

    //check if every employee is deleted.
    const alreadyDeleted = emplExist.every(
      (emp) => emp.getDataValue("DELETED") === deleteStatus
    );

    if (alreadyDeleted) {
      return res.status(400).json({ message: "Delete status already set." });
    }

    const result = await Employee.update(
      { DELETED: deleteStatus, UPDATED_WHEN: new Date() },
      { where: { ID: { [Op.in]: emplIds } } }
    );

    res.status(200).json({
      message: "Employees updated successfully.",
      affectedRows: result[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Unable to delete employee - ${error}` });
  }
};

//get employee by id
//used in auth context
export const getEmployeeById = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response | any> => {
  const { empId } = req.params;
  try {
    if (!empId) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    const foundEmployee = await Employee.findByPk(empId);

    if (!foundEmployee) {
      return res.status(400).json({ message: "Employee does not exist as." });
    }

    res.status(200).json(foundEmployee);
  } catch (error) {
    console.error(`Unable to get employee by ID - ${error}`);
    res.status(500).json({ message: `Unable to get employee by ID -${error}` });
  }
};

export const getDeletedEmployees = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  const { departmentId } = req.query;

  if (!departmentId) {
    return res.status(400).json({ message: "Department id is  required." });
  }
  try {
    const { rows: employees } = await Employee.findAndCountAll({
      where: departmentId
        ? { DEPARTMENT_ID: departmentId, DELETED: { [Op.or]: [1, null] } }
        : { DELETED: { [Op.or]: [1, null] } },
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error("Unable to get deleted employees. ", error);
    res
      .status(500)
      .json({ message: "Unable to get deleted employees. ", error });
  }
};
