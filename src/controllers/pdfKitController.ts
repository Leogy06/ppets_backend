import Express from "express";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

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
