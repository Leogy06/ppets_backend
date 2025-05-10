export const pesoFormatter = (value: number | string) => {
  const num = parseFloat(value.toString().replace(/,/g, ""));
  return `PHP ${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
