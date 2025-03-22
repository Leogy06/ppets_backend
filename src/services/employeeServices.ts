import { Op, WhereOptions } from "sequelize";
import Employee from "../models/employee.js";
import { CustomError } from "../utils/CustomError.js";

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
    });
  },
};

export default employeeServices;
