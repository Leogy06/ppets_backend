import { Response } from "express";
import { ItemProps, TransactionProps } from "../@types/types.js";

//pdf kit
import PDFDocument from "pdfkit-table";
import { dateFormatter } from "../utils/dateFormatter.js";
import fullNamer, {
  getItemName,
  transactionStatus,
  transactionType,
} from "../utils/destructureUtil.js";

//end point - /api/pdf

export const getPdfReportService = async (
  res: Response,
  reports: TransactionProps[]
) => {
  const doc = new PDFDocument({
    margin: 30,
    size: [612, 936], //long bond paper
    layout: "landscape",
  });
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
    doc.fontSize(16).text("TRANSACTION LOGS", { align: "center" }).moveDown(2);

    // Current Date at the top right corner
    doc
      .fontSize(10)
      .text(dateFormatter(currentDate, "yyyy-MM-dd hh:mm a"), 740, 40, {
        align: "right",
      }) // Adjust the X and Y position
      .moveDown(6);
  };

  addHeader();

  //prepare table
  const table = {
    headers: [
      "Transaction Type",
      "Date Requested",
      "Item",
      "Status",
      "Quantity",
      "Borrower",
      "Owner",
    ],
    rows: reports.map((row: any) => [
      transactionType(row?.remarks),
      dateFormatter(row.createdAt),
      getItemName(row?.distributedItemDetails?.undistributedItemDetails),
      transactionStatus(row.status),
      `${row.quantity}`,
      fullNamer(row.borrowerEmpDetails),
      fullNamer(row.ownerEmpDetails),
    ]),
  };

  await doc.table(table, {
    x: 30,
    width: 860,
    columnsSize: [120, 120, 140, 80, 70, 160, 170],
    padding: [8],
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font("Helvetica").fontSize(10);

      if (
        indexRow !== undefined &&
        indexRow > 0 &&
        indexRow % 2 === 0 &&
        rectRow
      ) {
        doc
          .save()
          .lineWidth(0.5)
          .strokeColor("#d9d9d9")
          .rect(rectRow.x, rectRow.y, rectRow.width, rectRow.height)
          .stroke()
          .restore();
      }

      return doc;
    },
  });

  doc.end();
};

//generate item report pdf
export const generateItemReportService = async (
  res: Response,
  reports: ItemProps[]
) => {
  const doc = new PDFDocument({
    margin: 30,
    size: [612, 936], //long bond paper
    layout: "landscape",
  });
  const today = new Date().toDateString();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${today}.pdf`
  );

  doc.pipe(res);

  // Define consistent column widths
  const columnWidths = [280, 100, 140, 240, 120]; // Total: 876

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
      "Unit Value",
      "Accountable Person",
      "Distribution",
    ]; // Adjusted for long bond paper

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

  const addFooter = (currentPage: number, totalPages: number) => {
    doc.fontSize(10).text(`Page ${currentPage} of ${totalPages}`, 500, 920, {
      align: "center",
    });
  };

  let pageCount = 0;
  doc.on("pageAdded", () => {
    pageCount++;
  });

  addHeader();
  addTableHeader();

  let y = doc.y;
  const pageHeight = 612 - 20; // total height of the page minus margis

  // Loop through items
  reports.forEach((row: ItemProps, index: number) => {
    const startX = 50;
    let cellX = startX;
    let maxRowHeight = 20; // Default row height

    // Get row data
    const rowData = [
      getItemName(row?.undistributedItemDetails),
      `${String(row.quantity)}/${String(row.ORIGINAL_QUANTITY)}`,
      String(row.unit_value),
      fullNamer(row.accountableEmpDetails),
      dateFormatter(row.DISTRIBUTED_ON),
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

  doc.on("end", () => {
    addFooter(pageCount, pageCount);
  });

  doc.end();
};
