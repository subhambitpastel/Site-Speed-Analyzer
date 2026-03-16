import * as xlsx from "xlsx";

export const SUPPORTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export const SUPPORTED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", // .csv
  "application/csv",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_URLS = 500;

const URL_HEADER_KEYWORDS = ["url", "website", "site", "domain", "link"];

const URL_PATTERN = /https?:\/\/[^\s,;"'<>]+/gi;

/**
 * Parse a File object (xlsx, xls, or csv) and return extracted URLs.
 */
export async function parseFile(file: File): Promise<{ urls: string[]; truncated: boolean }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File exceeds the 10 MB size limit (${(file.size / 1024 / 1024).toFixed(1)} MB). Please use a smaller file.`
    );
  }

  const extension = getFileExtension(file.name);

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Unsupported file type "${extension}". Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}`
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("The uploaded file is empty.");
  }

  let workbook: xlsx.WorkBook;
  try {
    workbook = xlsx.read(arrayBuffer, { type: "array" });
  } catch {
    throw new Error(
      "Failed to parse the file. Please ensure it is a valid spreadsheet or CSV."
    );
  }

  if (!workbook.SheetNames.length) {
    throw new Error("The file contains no sheets.");
  }

  const allUrls: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (sheet) {
      const urls = extractURLsFromSheet(sheet);
      allUrls.push(...urls);
    }
  }

  const unique = Array.from(new Set(allUrls));

  if (unique.length === 0) {
    throw new Error("No valid URLs found in the file.");
  }

  const truncated = unique.length > MAX_URLS;
  return { urls: truncated ? unique.slice(0, MAX_URLS) : unique, truncated };
}

/**
 * Extract URLs from a single worksheet.
 *
 * Strategy:
 * 1. If a column header matches a URL-related keyword, extract values from that column.
 * 2. Otherwise, scan every cell for values matching an http/https pattern.
 */
function extractURLsFromSheet(sheet: xlsx.WorkSheet): string[] {
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (rows.length === 0) {
    return [];
  }

  const headers = Object.keys(rows[0]);

  // Check if any header matches a URL-related keyword
  const urlHeader = headers.find((header) =>
    URL_HEADER_KEYWORDS.some((keyword) =>
      header.toLowerCase().includes(keyword)
    )
  );

  const urls: string[] = [];

  if (urlHeader) {
    // Extract from the identified URL column
    for (const row of rows) {
      const value = row[urlHeader];
      if (typeof value === "string" && value.trim()) {
        const validated = validateUrl(value.trim());
        if (validated) {
          urls.push(validated);
        }
      }
    }
  } else {
    // Scan all cells for URL patterns
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        const cellValue = row[key];
        if (typeof cellValue === "string") {
          const matches = cellValue.match(URL_PATTERN);
          if (matches) {
            for (const match of matches) {
              const validated = validateUrl(match);
              if (validated) {
                urls.push(validated);
              }
            }
          }
        }
      }
    }
  }

  return urls;
}

/**
 * Validate a string as a URL using the URL constructor.
 * Returns the href if valid, or null otherwise.
 */
function validateUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract the file extension (lowercase, including the dot) from a filename.
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) {
    return "";
  }
  return filename.slice(lastDot).toLowerCase();
}
