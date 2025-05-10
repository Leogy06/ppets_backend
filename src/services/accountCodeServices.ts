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

export const editAccountCodeService = async (
  entry: Partial<AccountCodeProps>
) => {
  const { ID, ACCOUNT_CODE, ACCOUNT_TITLE, DELETED } = entry;
  if (!ACCOUNT_CODE || !ACCOUNT_TITLE || !ID || DELETED === null)
    throw new CustomError("Required Fields are empty", 400);

  const accountCodeExist = await AccountItem.findByPk(ID);

  if (!accountCodeExist) throw new CustomError("Account code not found. ", 404);

  await accountCodeExist.update({
    ACCOUNT_CODE,
    ACCOUNT_TITLE,
    DELETED,
  });

  return accountCodeExist;
};
