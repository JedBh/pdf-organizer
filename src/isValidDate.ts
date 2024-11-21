import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import dayjs from "dayjs";
import { parse, format, parseISO } from "date-fns";

// Words that are not part of the date
const badWords = ["Invoice", "Date"];

function removeDateSuffix(dateString: string): string {
  // Regular expression to match ordinal suffixes
  const suffixRegex = /\b(\d+)(st|nd|rd|th)\b/g;

  // Replace matched suffixes with just the number
  return dateString.replace(suffixRegex, (_, number) => number);
}

// Function to validate if a string is a valid date
function isValidDate(input: string): boolean {
  const dateFormats = [
    "DD/MM/YYYY",
    "DD MMM YYYY",
    "MMM DD YYYY",
    "DD-MMM-YYYY",
    "YYYY-MMM-DD",
    "YYYY/MM/DD",
    "YYYY-MM-DD",
    "MMM D, YYYY",
    "MMM YYYY", // To match "May 2024"
  ];

  // Check against the list of date formats
  return dateFormats.some((format) => dayjs(input, format, true).isValid());
}

// Function to remove leading dots from a line
function cleanLine(line: string): string {
  return line.replace(/^\.+/, "").trim(); // Remove leading dots and trim
}

// Function to extract valid dates from a line
function extractValidDates(line: string): string[] {
  const monthRegex =
    /(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec)\b/i;
  const numberRegex = /[0-9]+[-|./]/;

  let validDates: string[] = [];
  const potentialMatches = [
    line.match(monthRegex),
    line.match(numberRegex),
  ].filter(Boolean);

  potentialMatches.forEach((match) => {
    if (match) {
      const startIndex = line.indexOf(match[0]);
      let substring = line.slice(startIndex).trim();

      // Find the earliest occurrence of any bad word
      const earliestBadWordIndex = badWords
        .map((badWord) => substring.indexOf(badWord))
        .filter((index) => index !== -1)
        .reduce((min, current) => Math.min(min, current), substring.length);

      // Slice the substring up to the earliest bad word
      substring = removeDateSuffix(
        substring.slice(0, earliestBadWordIndex).trim()
      );

      if (isValidDate(substring)) {
        const parsedDate = dayjs(substring);
        const year = parsedDate.year();
        if (year !== 2024) {
          return;
        }

        validDates.push(substring);
      }
    }
  });

  return validDates;
}

function fomratDate(input: string) {
  const formats = [
    "MMMM d, yyyy, h:mm a", // e.g., "May 6, 2024, 9:12 PM"
    "MMMM d, yyyy", // e.g., "May 6, 2024"
    "yyyy-MM-dd", // e.g., "2024-05-22"
    "MMMM d yyyy", // e.g., "May 25 2024"
    "d-MMM-yyyy",
  ];

  let parsedDateV2;
  for (const dateFormat of formats) {
    try {
      parsedDateV2 = parse(input, dateFormat, new Date());

      if (parsedDateV2 instanceof Date && !isNaN(parsedDateV2.getTime())) {
        break; // If valid date, stop the loop
      }
    } catch (error) {
      // Skip errors for invalid formats
    }
  }
  // Fallback for ISO format (if not caught by parse)

  if (!parsedDateV2 || isNaN(parsedDateV2.getTime())) {
    parsedDateV2 = parseISO(input); // Use the original `dateString` here
  }

  // Format the parsed date as 'YYYY_MM_DD'
  return format(parsedDateV2, "yyyy_MM_dd");
  // Parse the date string
}

// Function to process text content from a PDF file
async function readPdfContentV2(filePath: string): Promise<string[]> {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);
    const lines = data.text.split(/\r?\n/).map(cleanLine); // Split into lines and clean them

    return [
      lines
        .flatMap(extractValidDates)
        .reduce((a, b) => (a.length > b.length ? a : b)),
    ]; // Extract dates from all lines
  } catch (error: any) {
    console.error(`Error reading PDF content: ${error.message}`);
    return [];
  }
}

// Function to process all PDF files in a directory
async function processAllPdfs(directoryPath: string): Promise<void> {
  const outputFile = "results.txt";
  const pdfFiles = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".pdf"));

  if (!pdfFiles.length) {
    console.log("No PDF files found in the directory.");
    return;
  }

  fs.writeFileSync(outputFile, "Extracted Dates:\n\n");

  for (const pdfFile of pdfFiles) {
    const filePath = path.join(directoryPath, pdfFile);
    try {
      const dates = await readPdfContentV2(filePath);

      if (dates.length) {
        const formattedDate = fomratDate(dates[0]);
        const newFileName = `[${formattedDate}]_${pdfFile}`;
        const newFilePath = path.join(directoryPath, newFileName);

        // Rename the file
        fs.renameSync(filePath, newFilePath);

        fs.appendFileSync(outputFile, `File: ${pdfFile}\n`);
        dates.forEach((date) =>
          fs.appendFileSync(outputFile, `  - ${fomratDate(date)}\n`)
        );
        fs.appendFileSync(outputFile, `\n---\n\n`);
      } else {
        fs.appendFileSync(
          outputFile,
          `File: ${pdfFile}\n  No valid dates found.\n\n---\n\n`
        );
      }
    } catch (error: any) {
      console.error(`Error processing ${pdfFile}:`, error.message);
      fs.appendFileSync(
        outputFile,
        `File: ${pdfFile}\n  Error processing file.\n\n---\n\n`
      );
    }
  }

  console.log(`Results written to ${outputFile}`);
}

// Run the script
const directoryPath = "pdfs";
processAllPdfs(directoryPath);
