import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

async function readPdfContentV2(filePath: string): Promise<void> {
  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(filePath);

    // Parse the PDF
    const data = await pdfParse(pdfBuffer);

    // Extract the text content
    const text = data.text;

    // Create a corresponding .txt file
    const outputFilePath = filePath.replace(/\.pdf$/i, ".txt");
    fs.writeFileSync(outputFilePath, text, "utf8");

    console.log(`Text content of ${filePath} written to ${outputFilePath}`);
  } catch (error: any) {
    console.error(`Error parsing PDF file ${filePath}: ${error?.message}`);
  }
}

// Example usage
const filePath = "pdfs/may 2024 webflow ASCEND (1).pdf"; // Replace with the actual file path
readPdfContentV2(filePath);
