const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

// Regex for matching dates (your provided regex)
const dateRegex =
  /\d{4}[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12][0-9]|3[01])|(?:\d{4}[-/.](0?[1-9]|[12][0-9]|3[01])[-/.](0?[1-9]|1[0-2])|(0?[1-9]|[12][0-9]|3[01])[-/.](0?[1-9]|1[0-2])[-/.]\d{4}|(0?[1-9]|1[0-2])[-/.](0?[1-9]|[12][0-9]|3[01])[-/.]\d{4}|(0?[1-9]|[12][0-9]|3[01])[-/.](0?[1-9]|1[0-2])[-/.](\d{4}))\b/gi;

// Regex to match full month names and abbreviations
const monthRegex =
  /(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec)/gi;

// Utility to standardize dates to [YYYY-MM-DD] format using Day.js
function standardizeDate(dateString: string, defaultYear = "2024") {
  let parsedDate = null;

  if (/^\d{4}[-/.]\d{2}[-/.]\d{2}$/.test(dateString)) {
    parsedDate = dayjs(dateString, "YYYY-MM-DD");
  } else if (/^[A-Za-z]+\s?\d{1,2}?,?\s?\d{4}?$/.test(dateString)) {
    parsedDate = dayjs(dateString, "MMMM D YYYY", true);
    if (!parsedDate.isValid()) {
      parsedDate = dayjs(`${dateString} ${defaultYear}`, "MMMM D YYYY", true);
    }
  }

  return parsedDate && parsedDate.isValid()
    ? parsedDate.format("YYYY-MM-DD")
    : null; // Return null for invalid dates
}

async function readPdfContent(filePath: string) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const datesFound = [...text.matchAll(dateRegex)].map((match) => match[0]);
    const monthsFound = [...text.matchAll(monthRegex)].map((match) => match[0]);

    const resolvedDates = datesFound.map((date) => date);

    const resolvedMonths = monthsFound.map((month) => {
      const contextRegex = new RegExp(
        `${month}\\s?(\\d{1,2})?\\s?(\\d{4})?`,
        "gi"
      );
      const contextMatch = contextRegex.exec(text);

      const day =
        contextMatch && contextMatch[1]
          ? contextMatch[1].padStart(2, "0")
          : "01";
      const year = contextMatch && contextMatch[2] ? contextMatch[2] : "2024";

      return `${month} ${day} ${year}`;
    });

    const allResolvedDates = [...resolvedDates, ...resolvedMonths];
    const standardizedDates = allResolvedDates
      .map((date) => standardizeDate(date))
      .filter(Boolean);

    return standardizedDates.length > 0 ? standardizedDates[0] : null;
  } catch (error: any) {
    throw new Error(`Error parsing PDF: ${error.message}`);
  }
}

async function processAllPdfFiles(directoryPath: string) {
  try {
    const files = fs.readdirSync(directoryPath);

    const pdfFiles = files.filter((file: string) => file.endsWith(".pdf"));

    if (pdfFiles.length === 0) {
      console.log("No PDF files found in the directory.");
      return;
    }

    for (const file of pdfFiles) {
      const filePath = path.join(directoryPath, file);
      try {
        const date = await readPdfContent(filePath);
        if (date) {
          const formattedDate = date.replace(/-/g, "_"); // Format to [YYYY_MM_DD]
          const newFileName = `[_${formattedDate}]${file}`;
          const newFilePath = path.join(directoryPath, newFileName);

          //   fs.renameSync(filePath, newFilePath);
          if (file === "Yishai Back_ May 2024.pdf") {
            console.log(formattedDate);
            console.log(`${file} renamed to ${newFileName}`);
          }
        } else {
          console.log(`${file} : No valid date found, skipping rename.`);
        }
      } catch (error: any) {
        console.log(`${file} : Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("Error processing PDF files:", error);
  }
}

// Example usage
const directoryPath = "pdfs"; // Path to the directory containing PDF files
processAllPdfFiles(directoryPath);
