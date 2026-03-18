import { parseURLs, validateURL, sanitizeAndValidate } from "@/lib/urlValidator";

describe("parseURLs", () => {
  it("splits multiline input into an array of trimmed strings", () => {
    const input = "https://example.com\nhttps://test.com\nhttps://foo.bar";
    expect(parseURLs(input)).toEqual([
      "https://example.com",
      "https://test.com",
      "https://foo.bar",
    ]);
  });

  it("handles Windows-style line endings (CRLF)", () => {
    const input = "https://a.com\r\nhttps://b.com\r\n";
    expect(parseURLs(input)).toEqual(["https://a.com", "https://b.com"]);
  });

  it("trims whitespace from each line", () => {
    const input = "  https://a.com  \n  https://b.com  ";
    expect(parseURLs(input)).toEqual(["https://a.com", "https://b.com"]);
  });

  it("filters out empty lines", () => {
    const input = "\nhttps://a.com\n\n\nhttps://b.com\n";
    expect(parseURLs(input)).toEqual(["https://a.com", "https://b.com"]);
  });

  it("returns an empty array for empty input", () => {
    expect(parseURLs("")).toEqual([]);
    expect(parseURLs("   \n  \n  ")).toEqual([]);
  });

  it("returns single URL for single-line input", () => {
    expect(parseURLs("https://single.com")).toEqual(["https://single.com"]);
  });
});

describe("validateURL", () => {
  it("returns true for valid https URLs", () => {
    expect(validateURL("https://example.com")).toBe(true);
    expect(validateURL("https://sub.domain.example.com/path?q=1")).toBe(true);
  });

  it("returns true for valid http URLs", () => {
    expect(validateURL("http://example.com")).toBe(true);
    expect(validateURL("http://localhost:3000")).toBe(true);
  });

  it("returns false for ftp or other protocols", () => {
    expect(validateURL("ftp://files.example.com")).toBe(false);
    expect(validateURL("mailto:user@example.com")).toBe(false);
    expect(validateURL("file:///etc/passwd")).toBe(false);
  });

  it("returns false for malformed URLs", () => {
    expect(validateURL("not-a-url")).toBe(false);
    expect(validateURL("")).toBe(false);
    expect(validateURL("://missing-protocol.com")).toBe(false);
  });

  it("returns false for URLs without a protocol", () => {
    expect(validateURL("example.com")).toBe(false);
    expect(validateURL("www.example.com")).toBe(false);
  });

  it("handles URLs with special characters", () => {
    expect(validateURL("https://example.com/path?q=hello+world&lang=en")).toBe(true);
    expect(validateURL("https://example.com/path#section")).toBe(true);
  });
});

describe("sanitizeAndValidate", () => {
  it("separates valid and invalid URLs", () => {
    const input = "https://good.com\nbad-url\nhttp://also-good.com\nno-protocol.com";
    const result = sanitizeAndValidate(input);
    expect(result.valid).toEqual(["https://good.com", "http://also-good.com"]);
    expect(result.invalid).toEqual(["bad-url", "no-protocol.com"]);
  });

  it("returns empty arrays for empty input", () => {
    const result = sanitizeAndValidate("");
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
  });

  it("returns all valid when all URLs are correct", () => {
    const input = "https://a.com\nhttps://b.com";
    const result = sanitizeAndValidate(input);
    expect(result.valid).toEqual(["https://a.com", "https://b.com"]);
    expect(result.invalid).toEqual([]);
  });

  it("returns all invalid when no URLs are correct", () => {
    const input = "bad1\nbad2\nnope";
    const result = sanitizeAndValidate(input);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual(["bad1", "bad2", "nope"]);
  });

  it("trims whitespace and filters empty lines before validating", () => {
    const input = "  https://good.com  \n\n  bad  \n";
    const result = sanitizeAndValidate(input);
    expect(result.valid).toEqual(["https://good.com"]);
    expect(result.invalid).toEqual(["bad"]);
  });
});
