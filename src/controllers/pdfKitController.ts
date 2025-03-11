import Express from "express";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { logger } from "../logger/logger.js";

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

export const renderRequestPDF = (
  req: Express.Request,
  res: Express.Response
) => {
  const { requestRows } = req.body; // array of objects

  if (!Array.isArray(requestRows)) {
    return res.status(400).json({
      message: "Invalid data format. requestROws must be an array of object.",
      requestRows,
    });
  }

  try {
    const doc = new PDFDocument({ layout: "landscape", margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

    //title
    doc.fontSize(20).text("Request Report", { align: "center" }).moveDown(2);

    //table header

    const headers = [
      "Item",
      "Quantity",
      "Status",
      "Accountable Employee",
      "Borrower",
      "Requested on",
    ];
    const columnWidths = [150, 250, 100, 150];

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

    requestRows.forEach((row: any) => {
      y = doc.y;
      //for the item name
      doc.text(row.itemDetails.ITEM_NAME, 50, y);

      //for the quantity of the requested item
      doc.text(row.quantity.toString(), 50, y);

      //status if approved, pending or not
      doc.text(row.statusDetails, 200, y);

      //the accountable person name
      doc.text(
        `${row.ownerEmp.FIRSTNAME} ${row.ownerEmp.LASTNAME} ${
          row.ownerEmp?.MIDDLENAME
        } ${row.ownerEmp?.SUFFIX ?? ""}`,
        450,
        y
      );

      //t
      doc.text(
        `${row.borrowerEmp.FIRSTNAME} ${row.borrowerEmp.LASTNAME} ${
          row.borrowerEmp?.MIDDLENAME ?? ""
        } ${row.borrowerEmp?.SUFFIX ?? ""}`,
        550,
        y
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error("Unable to render request PDF. ", error);
    res.status(500).json({ message: "Unable to render request PDF. ", error });
  }
};
