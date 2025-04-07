import { Op, WhereOptions } from "sequelize";
import TransactionModel from "../models/transactionModel.js";
import { TransactionProps } from "../@types/types.js";
import { CustomError } from "../utils/CustomError.js";

interface IFilters {
  //required fields
  departmentId: TransactionProps["DPT_ID"];

  //optional fields
  startDate?: string;
  endDate?: string;
  status?: TransactionProps["status"];
  remarks?: TransactionProps["remarks"];
}

export const buildTransactionService = async (filters: IFilters) => {
  const { departmentId, startDate, endDate } = filters;
  //check if the filters are valid
  if (!departmentId) {
    throw new CustomError("Departmen field is missing.", 400);
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
  });

  return transactions;
};
