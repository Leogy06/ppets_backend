import { format } from "date-fns";

export const dateFormatter = (date: string, formatString = "MM/dd/yyyy") => {
  if (!date) {
    return "";
  }

  const formattedDate = format(new Date(date), formatString);

  return formattedDate;
};
