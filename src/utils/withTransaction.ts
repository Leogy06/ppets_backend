import { Transaction } from "sequelize";
import sequelize from "../db/config.js";

export const withTransaction = async <T>(
  fn: (transaction: Transaction) => Promise<T>
) => {
  const transaction = await sequelize.transaction();

  try {
    const response = await fn(transaction);
    await transaction.commit();
    return response;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
