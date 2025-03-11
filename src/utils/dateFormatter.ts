import { format } from "date-fns";

export const dateFormatter = (date: string, formatString = "MM/dd/yyyy") => {
  const formattedDate = format(new Date(date), formatString);

  return formattedDate;
};
