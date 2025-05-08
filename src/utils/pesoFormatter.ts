export const pesoFormatter = (value: number | string) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(parseFloat(value.toString().replace(/,/g, "")));
};
