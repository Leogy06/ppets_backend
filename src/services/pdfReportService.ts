import { Response } from "express";
import { TransactionProps } from "../@types/types.js";
import PDFDocument from "pdfkit";
import { dateFormatter } from "../utils/dateFormatter.js";

//end point - /api/pdf
const doc = new PDFDocument({
  margin: 30,
  size: [612, 936], //long bond paper
  layout: "landscape",
});

export const getPdfReportService = async (
  res: Response,
  reports: TransactionProps[]
) => {
  const today = new Date().toDateString();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${today}.pdf`
  );

  doc.pipe(res);

  // Define consistent column widths
  const columnWidths = [110, 50, 100, 70, 70, 50, 50, 70, 70, 70, 120];

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
      "Transaction",
      "Date Requested",
      "Item",
      "Status",
      "Quantity",
      "Borrower",
      "Owner",
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

  let y = doc.y;
  const pageHeight = 612 - 20; // total height of the page minus margis

  // Loop through items
  reports.forEach((row: any, index: number) => {
    const startX = 50;
    let cellX = startX;
    let maxRowHeight = 20; // Default row height

    // Get row data
    const rowData = [
      row?.remarks ?? "",
      dateFormatter(row.createdAt),
      `${row.quantity}`,
      row?.are_no ?? "",
      row?.ics ?? "",
      row?.itemDetails?.PROP_NO ?? "",
      row?.itemDetails?.SERIAL_NO ?? "",
      row?.class_no ?? "",
      row?.unit_value ?? "",
      row?.total_value ?? "",
      row?.accountablePerson ?? "",
    ];

    // Determine max row height based on text wrapping
    rowData.forEach((text, i) => {
      const textHeight = doc.heightOfString(text, { width: columnWidths[i] });
      maxRowHeight = Math.max(maxRowHeight, textHeight + 5); // Add padding
    });

    // Create new page if needed
    if (y + maxRowHeight > pageHeight) {
      doc.addPage();
      addHeader();
      addTableHeader();
      y = doc.y;
    }

    // Alternate row shading
    if (index % 2 === 0) {
      doc
        .rect(
          startX - 5,
          y - 2,
          columnWidths.reduce((a, b) => a + b, 0),
          maxRowHeight
        )
        .fill("#f2f2f2")
        .fillColor("black");
    }

    // Render text in each cell
    rowData.forEach((text, i) => {
      doc.text(text, cellX, y, { width: columnWidths[i], align: "left" });
      cellX += columnWidths[i];
    });

    y += maxRowHeight; // Move to next row position
  });

  doc.end();
};
