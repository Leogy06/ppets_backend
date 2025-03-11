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
