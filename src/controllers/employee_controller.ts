import Employee from "../models/employee.ts";

//for employee page
export const getEmployees = async (req: any, res: any) => {
  try {
    const employee = await Employee.findAll();

    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
