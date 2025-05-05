import {
  EmployeeProps,
  ItemModelProps,
  ItemProps,
  TransactionProps,
} from "../@types/types.js";

//for item name
export const getItemName = (itemDetails: ItemModelProps) => {
  return `${itemDetails?.ITEM_NAME ?? "--"}`.trim();
};

//-remarks, 1-borrowing, 2-lending, 3-distribution, 4-transfer
export const transactionType = (type: TransactionProps["remarks"]) => {
  switch (type) {
    case 1:
      return "Borrowing Item";
    case 2:
      return "Lending Item";
    case 3:
      return "Distribution Item";
    case 4:
      return "Transfer Item";

    case 5:
      return "Returning Item";
    default:
      return "Unknown transaction type";
  }
};

//transaction status
export const transactionStatus = (status: TransactionProps["status"]) => {
  switch (status) {
    case 1:
      return "Approved";
    case 2:
      return "Pending";
    case 3:
      return "Cancelled";
    case 4:
      return "Rejected";
    default:
      return "Unknown transaction status";
  }
};

//employe namer

const fullNamer = (employeeDetails: EmployeeProps) => {
  if (!employeeDetails) return "--"; // this is for borrower, some notif has no need for borrower like distribution

  return `${employeeDetails.LASTNAME}, ${employeeDetails.FIRSTNAME} ${
    employeeDetails.MIDDLENAME ?? ""
  } ${employeeDetails.SUFFIX ?? ""}`.toUpperCase();
};
export default fullNamer;
