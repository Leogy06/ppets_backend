import { Request, Response } from "express";
import { TransactionProps } from "../@types/types.js";
import PDFDocument from "pdfkit";
import { dateFormatter } from "../utils/dateFormatter.js";

//end point - /api/pdf
const doc = new PDFDocument({
  margin: 30,
  size: [612, 936], //long bond paper
});

export const getPdfReportService = async (
  res: Response,
  report: TransactionProps[]
) => {
  const today = new Date().toDateString();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${today}.pdf`
  );

  doc.pipe(res);

  //title
  //title
  const addHeader = () => {
    const currentDate = new Date().toString();

    doc
      .fontSize(9)
      .text("Republic of the Philippines", { align: "center" })
      .moveDown(0.5);
    doc
      .fontSize(12)
      .text("CITY ACCOUNTANT'S OFFICE", { align: "center" })
      .moveDown(0.2);
    doc
      .fontSize(9)
      .text("General Santos City", { align: "center" })
      .moveDown(0.5);
    doc
      .fontSize(16)
      .text("ITEM REQUESTS LOGS", { align: "center" })
      .moveDown(2);

    // Current Date at the top right corner
    doc
      .fontSize(10)
      .text(dateFormatter(currentDate, "yyyy-MM-dd hh:mm a"), 740, 40, {
        align: "right",
      }) // Adjust the X and Y position
      .moveDown(6);
  };

  //table header
  const addTableHeader = () => {
    const headers = [
      "Item",
      "Quantity",
      "Status",
      "Accountable Employee",
      "Borrower",
      "Requested on",
    ];
    const columnWidths = [170, 80, 100, 180, 180, 180]; // Adjusted for long bond paper

    let y = doc.y;
    doc.font("Helvetica-Bold").fontSize(12);

    headers.forEach((header, i) => {
      doc.text(
        header,
        50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y
      );
    });

    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(10);
  };

  addHeader();
  addTableHeader();

  doc.end();
};
