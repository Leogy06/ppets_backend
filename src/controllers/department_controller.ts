import Department from "../models/department.js";

export const getDepartments = async (req: any, res: any) => {
  try {
    const departments = await Department.findAll();

    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Unable to fetch department - ${error}` });
  }
};
