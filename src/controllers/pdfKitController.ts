import Express from "express";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { logger } from "../logger/logger.js";
import { dateFormatter } from "../utils/dateFormatter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadPdf = (req: Express.Request, res: Express.Response) => {
  try {
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("This is a  dynamic generated PDF!", 100, 100);

    doc.moveDown();

    doc.text("Employee Name: John DOe", { underline: true });
    doc.text("Position: Property Custodian");
    doc.text("Job: LGU-City Accountant's Office.");

    const imagePath = path.join(__dirname, "../assets/images/gensan-lgu.png");

    if (fs.existsSync(imagePath)) {
      doc.image(imagePath, 150, 250, { width: 100 });
    } else {
      console.error("Image not found: ", imagePath);
    }

    doc.end(); //finalized pdf
  } catch (error) {
    console.error("\x1b[31m\x1b[1m✖Unable to download PDF. ", error);
    res.status(500).json({ message: "Unable to download PDF. ", error });
  }
};

//render requests pdf
export const renderRequestPDF = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const { requestRows } = req.body; // array of objects

  if (!Array.isArray(requestRows)) {
    return res.status(400).json({
      message: "Invalid data format. requestROws must be an array of object.",
      requestRows,
    });
  }

  try {
    const doc = new PDFDocument({
      layout: "landscape",
      margin: 30,
      size: [612, 936],
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

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

    //add first page header and table header
    addHeader();
    addTableHeader();

    let y = doc.y;
    const pageHeight = 612 - 60; // total height of the page minus margis

    //loop
    requestRows.forEach((row: any, index: number) => {
      const rowHeight = 20;
      const startX = 50;
      const columnWidths = [170, 80, 100, 180, 180, 180];

      if (y + rowHeight > pageHeight) {
        doc.addPage(); //add new page pdfkit
        addHeader(); //re-add header
        addTableHeader(); //re-add table header
        y = doc.y; //reset position
      }

      if (index % 2 === 0) {
        doc
          .rect(
            startX - 5,
            y - 2,
            columnWidths.reduce((a, b) => a + b, 0),
            rowHeight
          )
          .fill("#f2f2f2") // light gray background
          .fillColor("black"); //reset text color
      }

      let cellX = startX;

      //item name cell
      doc.text(row?.itemDetails?.ITEM_NAME ?? "", cellX, y);
      cellX += columnWidths[0];

      //item quantity requested
      doc.text(`${row.quantity}`, cellX, y);
      cellX += columnWidths[1];

      //transaction status
      doc.text(row?.statusDetails.description.toUpperCase(), cellX, y);
      cellX += columnWidths[2];

      //owner cell
      doc.text(
        `${row?.ownerEmp?.FIRSTNAME ?? ""} ${row?.ownerEmp?.LASTNAME ?? ""} ${
          row?.ownerEmp?.MIDDLENAME ?? ""
        } ${row?.ownerEmp?.SUFFIX ?? ""}`,
        cellX,
        y
      );
      cellX += columnWidths[3];

      //borrower cell
      doc.text(
        `${row.borrowerEmp?.FIRSTNAME ?? "--"} ${
          row.borrowerEmp?.LASTNAME ?? ""
        } ${row.borrowerEmp?.MIDDLENAME ?? ""} ${
          row.borrowerEmp?.SUFFIX ?? ""
        }`,
        cellX,
        y
      );

      //created transaction date
      cellX += columnWidths[4];
      doc.text(row.createdAt ? dateFormatter(row.createdAt) : "", cellX, y);

      y += rowHeight; //move y position own for next row
    });

    doc.end();
  } catch (error) {
    console.error("Unable to render request PDF. ", error);
    res
      .status(500)
      .json({ message: "Unable to render request PDF. ", error, requestRows });
  }
};

//render items pdf's
export const renderItemPDF = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const { items } = req.body; // array of objects

  if (!Array.isArray(items)) {
    return res.status(400).json({
      message: "Invalid data format. requestROws must be an array of object.",
      items,
    });
  }

  try {
    const doc = new PDFDocument({
      layout: "landscape",
      margin: 20,
      size: [612, 936],
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

    // Define consistent column widths
    const columnWidths = [110, 50, 100, 70, 70, 50, 50, 70, 70, 70, 120];

    //title page header
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
        .text("PROPERTY ACCOUNTABILITY", { align: "center" })
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
        "Date Acquired",
        "Are No.",
        "ICS No.",
        "PROP No.",
        "Serial No.",
        "Account Code.",
        "Unit Value.",
        "Total Value.",
        "Accountable Person",
      ];

      let x = 50;
      let y = doc.y;
      doc.font("Helvetica-Bold").fontSize(12);

      headers.forEach((header, i) => {
        doc.text(header, x, y, { width: columnWidths[i], align: "center" });
        x += columnWidths[i];
      });

      doc.moveDown(0.5);
      doc.font("Helvetica").fontSize(10);
    };

    //add first page header and table header
    addHeader();
    addTableHeader();

    let y = doc.y;
    const pageHeight = 612 - 20; // total height of the page minus margis

    // Loop through items
    items.forEach((row: any, index: number) => {
      const startX = 50;
      let cellX = startX;
      let maxRowHeight = 20; // Default row height

      // Get row data
      const rowData = [
        row?.itemDetails?.ITEM_NAME ?? "",
        `${row.quantity}`,
        dateFormatter(row.DISTRIBUTED_ON),
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
  } catch (error) {
    console.error("Unable to render request PDF. ", error);
    res
      .status(500)
      .json({ message: "Unable to render request PDF. ", error, items });
  }
};

//render owned items pdf's
export const renderOwnedItemPDF = async (
  req: Express.Request,
  res: Express.Response
): Promise<any> => {
  const { items } = req.body; // array of objects

  if (!Array.isArray(items)) {
    return res.status(400).json({
      message: "Invalid data format. requestROws must be an array of object.",
      items,
    });
  }

  try {
    const doc = new PDFDocument({
      layout: "landscape",
      margin: 20,
      size: [612, 936],
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

    // Define consistent column widths
    const columnWidths = [110, 50, 100, 70, 70, 50, 50, 70, 70, 70, 120];

    //title page header
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
        .text("PROPERTY ACCOUNTABILITY", { align: "center" })
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
        "Date Acquired",
        "PAR No.",
        "ICS No.",
        "PROP No.",
        "Serial No.",
        "Class No.",
        "Unit Value.",
        "Total Value.",
        "Accountable Person No.",
      ];

      let x = 50;
      let y = doc.y;
      doc.font("Helvetica-Bold").fontSize(12);

      headers.forEach((header, i) => {
        doc.text(header, x, y, { width: columnWidths[i], align: "center" });
        x += columnWidths[i];
      });

      doc.moveDown(0.5);
      doc.font("Helvetica").fontSize(10);
    };

    //add first page header and table header
    addHeader();
    addTableHeader();

    let y = doc.y;
    const pageHeight = 612 - 20; // total height of the page minus margis

    // Loop through items
    items.forEach((row: any, index: number) => {
      const startX = 50;
      let cellX = startX;
      let maxRowHeight = 20; // Default row height

      // Get row data
      const rowData = [
        row?.itemDetails?.ITEM_NAME ?? "",
        `${row.quantity}`,
        dateFormatter(row.DISTRIBUTED_ON),
        row?.parNo ?? "",
        row?.icsNo ?? "",
        row?.propNo ?? "",
        row?.propNo ?? "",
        row?.accountCode ?? "",
        row?.unit_value ?? "",
        row?.total_value ?? "",
        `${row?.accountableEmpDetails?.FIRSTNAME ?? ""} ${
          row?.accountableEmpDetails?.LASTNAME ?? ""
        } ${row?.accountableEmpDetails?.MIDDLENAME ?? ""} ${
          row?.accountableEmpDetails?.SUFFIX ?? ""
        }`,
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
  } catch (error) {
    console.error("Unable to render request PDF. ", error);
    res
      .status(500)
      .json({ message: "Unable to render request PDF. ", error, items });
  }
};
