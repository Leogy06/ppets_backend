import { EmployeeProps } from "../@types/types.js";
import { logger } from "../logger/logger.js";

const employeeFullName = (employee: EmployeeProps) => {
  if (!employee) {
    logger.info("Executing from employeeFullName utils., employee not found.");
    return;
  }
  return `${employee.FIRSTNAME} ${employee?.MIDDLENAME ?? ""} ${
    employee.LASTNAME
  } ${employee?.SUFFIX ?? ""}`;
};

export default employeeFullName;
