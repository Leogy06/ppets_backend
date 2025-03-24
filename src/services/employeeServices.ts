import { Op, WhereOptions } from "sequelize";
import Employee from "../models/employee.js";
import { CustomError } from "../utils/CustomError.js";
import Department from "../models/department.js";
import { EmployeeProps } from "../@types/types.js";
import { logger } from "../logger/logger.js";

interface EmployeeServiceProps {
  departmentId: number;
  limit?: number;
}

const employeeServices = {
  async getEmployees({ departmentId, limit }: EmployeeServiceProps) {
    if (!departmentId) throw new CustomError("Department id is required.", 400);

    const whereClause: WhereOptions<any> = {};

    if (departmentId) whereClause.CURRENT_DPT_ID = departmentId;

    //filter deleted
    whereClause.DELETED = { [Op.or]: [0, null] };

    return await Employee.findAll({
      where: whereClause,
      limit: limit ? limit : 10,
      order: [["LASTNAME", "ASC"]],
      include: [
        { model: Department, as: "departmentDetails" },
        { model: Employee, as: "creator" },
        { model: Employee, as: "updater" },
      ],
    });
  },

  //edit employee
  async editEmployee(data: EmployeeProps) {
    if (!data.ID) {
      throw new CustomError("ID is required.", 400);
    }

    //check if theres employee in that id
    const employee = await Employee.findByPk(data.ID);

    if (!employee || !data.UPDATED_BY) {
      throw new CustomError("Required fields are missing.", 400);
    }

    //check if new id number is duplicated
    //chec everyone except the employee editing
    if (data.ID_NUMBER) {
      const isIDExist = await Employee.findOne({
        where: { ID_NUMBER: data.ID_NUMBER, ID: { [Op.ne]: data.ID } },
      });
      if (isIDExist) {
        throw new CustomError("ID number is already taken.", 400);
      }
    }

    const editEntries: Partial<EmployeeProps> = {};

    if (data.ID_NUMBER) {
      editEntries.ID_NUMBER = data.ID_NUMBER;
    }
    if (data.FIRSTNAME) {
      editEntries.FIRSTNAME = data.FIRSTNAME;
    }
    if (data.MIDDLENAME) {
      editEntries.MIDDLENAME = data.MIDDLENAME;
    }
    if (data.LASTNAME) {
      editEntries.LASTNAME = data.LASTNAME;
    }
    if (data.SUFFIX) {
      editEntries.SUFFIX = data.SUFFIX;
    }
    if (data.DEPARTMENT_ID) {
      editEntries.DEPARTMENT_ID = data.DEPARTMENT_ID;
    }
    if (data.CURRENT_DPT_ID) {
      editEntries.CURRENT_DPT_ID = data.CURRENT_DPT_ID;
    }

    if (data.DELETED !== undefined) {
      editEntries.DELETED = data.DELETED;
    }

    //default values
    editEntries.UPDATED_WHEN = new Date();
    editEntries.UPDATED_BY = data.UPDATED_BY; // change this into dynamic

    return await Employee.update(editEntries, { where: { ID: data.ID } });
  },

  //delete employee
  async deleteEmployee(IDs: EmployeeProps["ID"][]) {
    logger.info("IDs ", IDs);

    if (!IDs) {
      throw new CustomError("IDs is required.", 400);
    }

    //check if ids are array
    if (!Array.isArray(IDs)) {
      throw new CustomError("IDs must be an array.", 400);
    }

    const existingEmployee = await Employee.findAll({
      where: { ID: { [Op.in]: IDs } },
    });

    if (existingEmployee.length !== IDs.length) {
      throw new CustomError("ID does not exist.", 400);
    }

    await Employee.update({ DELETED: 1 }, { where: { ID: { [Op.in]: IDs } } });

    return { message: "Employee successfully deleted." };
  },

  //get employee by id
  async getEmployeeByIdService(ID: EmployeeProps["ID"]) {
    if (!ID) {
      throw new CustomError("ID is required.", 400);
    }

    return await Employee.findByPk(ID);
  },
};

export default employeeServices;
