import BorrowingTransaction from "../models/transactionModel.js";
import Item from "../models/distributedItemModel.js";
import ItemCategory from "../models/item_category.js";
import ItemModel from "../models/itemModel.js";
import Notification from "../models/notificationModel.js";

export interface EmployeeProps {
  ID: number;
  ID_NUMBER: number;
  FIRSTNAME: string;
  MIDDLENAME?: string | null;
  LASTNAME: string;
  SUFFIX?: string | null;
  DEPARTMENT_ID: number;
  CURRENT_DPT_ID?: number | null;
  CREATED_BY?: number | null;
  CREATED_WHEN?: Date | null;
  UPDATED_BY?: number | null;
  UPDATED_WHEN?: Date | null;
  DELETED?: 0 | 1;
}

export interface DepartmentProps {
  ID: number; // auto_increment primary key
  DEPARTMENT_NAME?: string | null;
  CODE?: string | null;
  DESCRIPTION?: string | null;
  OFFICER?: string | null;
  POSITION?: string | null;
  ENTRY_DATE?: Date | null;
}

export interface ItemProps extends Item {
  id: number;
  name: string;
  description: string;
  quantity: number;
  ics?: string | null;
  are_no?: string | null;
  prop_no?: string | null;
  serial_no?: string | null;
  pis_no?: string | null;
  class_no?: string | null;
  acct_code?: string | null;
  unit_value: number;
  accountable_emp?: number | null;
  total_value: number;
  remarks?: string | null;
  status: number;
  category_item: number;
  deleted: 0 | 1; // Assuming it's a boolean-like tinyint
  added_by: number;
  createdAt: Date;
  updatedAt: Date;
  itemDetails: ItemModelProps;
  ITEM_ID: number;
}

export interface ItemCategoryProps extends ItemCategory {
  id: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolesProps {
  id: number;
  description: string;
}
export interface UserTypeProps {
  id: number;
  description: string;
}

export interface UserProps {
  id: number;
  username: string;
  password: string;
  email?: string | null;
  is_active: number; // Assuming it's a boolean-like integer (1 for active, 0 for inactive)
  role: number;
  emp_id: number;
  current_dpt_id: number;
}

export interface BorrowingTransactionProps extends BorrowingTransaction {
  id: number;
  distributed_item_id: number;
  borrower_emp_id: number;
  owner_emp_id: number;
  quantity: number;
  status: number;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationProps extends Notification {
  ID: number;
  MESSAGE: number;
  READ: number;
  TRANSACTION_ID: number | null;
}

//items new
export interface ItemModelProps extends ItemModel {
  ID: number;
  ITEM_NAME: string;
  DESCRIPTION: string;
  STOCK_QUANTITY: number;
  UNIT_VALUE: number;
  TOTAL_VALUE: number;
  DELETE: number;
  ORIGINAL_STOCK: number;
  DEPARTMENT_ID: number;
}
