/**
 * Parses a multiline string of URLs into an array.
 * Splits by newline, trims whitespace, and filters out empty lines.
 */
export function parseURLs(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Validates that a string is a well-formed HTTP or HTTPS URL.
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Parses, sanitizes, and validates a multiline URL input string.
 * Returns separate arrays of valid and invalid URLs.
 */
export function sanitizeAndValidate(input: string): {
  valid: string[];
  invalid: string[];
} {
  const urls = parseURLs(input);
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const url of urls) {
    if (validateURL(url)) {
      valid.push(url);
    } else {
      invalid.push(url);
    }
  }

  return { valid, invalid };
}
