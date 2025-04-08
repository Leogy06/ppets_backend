//this service is for options fetching
//fetching employee to select but with only specific columns
//to improve performance of fetching data

import { EmployeeProps } from "../@types/types.js";
import Employee from "../models/employee.js";
import { CustomError } from "../utils/CustomError.js";

export const fetchEmployeeOptionService = async (
  dapartmentId: EmployeeProps["CURRENT_DPT_ID"]
) => {
  if (!dapartmentId) throw new CustomError("Dapartment id is required.", 400);

  return await Employee.findAll({
    attributes: [
      "ID",
      "ID_NUMBER",
      "FIRSTNAME",
      "LASTNAME",
      "SUFFIX",
      "MIDDLENAME",
    ],
    where: { CURRENT_DPT_ID: dapartmentId },
  });
};
