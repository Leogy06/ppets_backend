import { AccountCodeProps } from "../@types/types.js";
import AccountItem from "../models/accountItemModel.js";
import { CustomError } from "../utils/CustomError.js";

export const createAccountCodeService = async (
  entry: Partial<AccountCodeProps>
) => {
  const { ACCOUNT_CODE, ACCOUNT_TITLE } = entry;
  if (!ACCOUNT_CODE || !ACCOUNT_TITLE)
    throw new CustomError("Required Fields are empty.", 400);

  return await AccountItem.create(entry);
};

//get all account codes
export const getAllAccountCodeService = async () => {
  return await AccountItem.findAll();
};
