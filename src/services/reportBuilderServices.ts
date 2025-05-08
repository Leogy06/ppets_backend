import { Model, Op, WhereOptions } from "sequelize";
import TransactionModel from "../models/transactionModel.js";
import { EmployeeProps, TransactionProps } from "../@types/types.js";
import { CustomError } from "../utils/CustomError.js";
import Employee from "../models/employee.js";
import Item from "../models/distributedItemModel.js";
import ItemModel from "../models/itemModel.js";
import AccountItem from "../models/accountItemModel.js";

interface IFilters {
  //required fields
  departmentId: TransactionProps["DPT_ID"];

  //optional fields
  startDate?: string;
  endDate?: string;
  status?: TransactionProps["status"];
  remarks?: TransactionProps["remarks"];

  //for item build report service
  employeeId?: EmployeeProps["ID"];
}

export const buildTransactionService = async (filters: IFilters) => {
  const { departmentId, startDate, endDate } = filters;
  //check if the filters are valid
  if (!departmentId) {
    throw new CustomError("Department field is missing.", 400);
  }

  let start: Date | undefined;
  let end: Date | undefined;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);

    //check if date is valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new CustomError("Date is invalid.", 400);
    }

    if (start > end) {
      throw new CustomError("Start date cannot be after end date.", 400);
    }
  }

  //where clause
  const whereClause: WhereOptions = {
    DPT_ID: departmentId,
  };

  //if have time range
  if (start && end)
    whereClause.createdAt = {
      [Op.between]: [start, end],
    };

  const transactions = await TransactionModel.findAll({
    where: whereClause,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Employee, as: "borrowerEmpDetails" },
      { model: Employee, as: "ownerEmpDetails" },
      {
        model: Item,
        as: "distributedItemDetails",
        include: [
          {
            model: ItemModel,
            as: "undistributedItemDetails",
          },
        ],
      },
    ],
  });

  return transactions;
};

export const buildItemReportService = async (filters: IFilters) => {
  const { departmentId, startDate, endDate, employeeId } = filters;

  //check if the filters are valid
  if (!departmentId) {
    throw new CustomError("Department field is missing.", 400);
  }

  let start: Date | undefined;
  let end: Date | undefined;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);

    //check if date is valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new CustomError("Date is invalid.", 400);
    }

    if (start > end) {
      throw new CustomError("Start date cannot be after end date.", 400);
    }
  }

  const whereClause: WhereOptions = {
    current_dpt_id: departmentId,
  };

  if (start && end)
    whereClause.createdAt = {
      [Op.between]: [start, end],
    };

  if (employeeId) {
    whereClause.accountable_emp = employeeId;
  }

  const items = await Item.findAll({
    where: whereClause,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: ItemModel,
        as: "undistributedItemDetails",
        include: [{ model: AccountItem, as: "accountCodeDetails" }],
      },
      { model: Employee, as: "accountableEmpDetails" },
    ],
  });

  return items;
};
