import { parseReport } from "@/lib/reportParser";
import type { LighthouseReport } from "@/types/report";

function makeFullApiResponse() {
  return {
    lighthouseResult: {
      categories: {
        performance: { score: 0.92 },
        accessibility: { score: 0.85 },
        seo: { score: 0.78 },
        "best-practices": { score: 0.95 },
      },
      audits: {
        "first-contentful-paint": {
          numericValue: 1200,
          displayValue: "1.2 s",
        },
        "largest-contentful-paint": {
          numericValue: 2500,
          displayValue: "2.5 s",
        },
        "total-blocking-time": {
          numericValue: 150,
          displayValue: "150 ms",
        },
        "cumulative-layout-shift": {
          numericValue: 0.05,
          displayValue: "0.05",
        },
        interactive: {
          numericValue: 3200,
          displayValue: "3.2 s",
        },
      },
    },
  };
}

describe("parseReport", () => {
  it("parses a complete API response correctly", () => {
    const result = parseReport("https://example.com", makeFullApiResponse(), "desktop");

    expect(result.url).toBe("https://example.com");
    expect(result.strategy).toBe("desktop");
    expect(result.error).toBeUndefined();

    // Scores are multiplied by 100 and rounded
    expect(result.scores.performance).toBe(92);
    expect(result.scores.accessibility).toBe(85);
    expect(result.scores.seo).toBe(78);
    expect(result.scores.bestPractices).toBe(95);

    // Core Web Vitals
    expect(result.coreWebVitals.fcp).toEqual({ value: 1200, displayValue: "1.2 s" });
    expect(result.coreWebVitals.lcp).toEqual({ value: 2500, displayValue: "2.5 s" });
    expect(result.coreWebVitals.tbt).toEqual({ value: 150, displayValue: "150 ms" });
    expect(result.coreWebVitals.cls).toEqual({ value: 0.05, displayValue: "0.05" });
    expect(result.coreWebVitals.tti).toEqual({ value: 3200, displayValue: "3.2 s" });

    // fetchedAt should be an ISO string
    expect(result.fetchedAt).toBeTruthy();
    expect(() => new Date(result.fetchedAt)).not.toThrow();
  });

  it("returns default report with error when lighthouseResult is missing", () => {
    const result = parseReport("https://example.com", {}, "mobile");

    expect(result.url).toBe("https://example.com");
    expect(result.strategy).toBe("mobile");
    expect(result.error).toBe("No Lighthouse result found in API response.");
    expect(result.scores).toEqual({
      performance: 0,
      accessibility: 0,
      seo: 0,
      bestPractices: 0,
    });
    expect(result.coreWebVitals.fcp).toEqual({ value: 0, displayValue: "N/A" });
  });

  it("returns default report when apiResponse is null/undefined", () => {
    const result = parseReport("https://example.com", null, "desktop");
    expect(result.error).toBe("No Lighthouse result found in API response.");
    expect(result.scores.performance).toBe(0);
  });

  it("handles missing categories gracefully", () => {
    const response = {
      lighthouseResult: {
        categories: {},
        audits: {},
      },
    };
    const result = parseReport("https://example.com", response, "mobile");

    expect(result.scores.performance).toBe(0);
    expect(result.scores.accessibility).toBe(0);
    expect(result.scores.seo).toBe(0);
    expect(result.scores.bestPractices).toBe(0);
    expect(result.error).toBeUndefined();
  });

  it("handles missing audits gracefully", () => {
    const response = {
      lighthouseResult: {
        categories: {
          performance: { score: 0.5 },
        },
        audits: {},
      },
    };
    const result = parseReport("https://example.com", response, "desktop");

    expect(result.scores.performance).toBe(50);
    expect(result.coreWebVitals.fcp).toEqual({ value: 0, displayValue: "N/A" });
    expect(result.coreWebVitals.lcp).toEqual({ value: 0, displayValue: "N/A" });
  });

  it("handles non-numeric score values", () => {
    const response = {
      lighthouseResult: {
        categories: {
          performance: { score: "not-a-number" },
          accessibility: { score: null },
          seo: {},
        },
        audits: {},
      },
    };
    const result = parseReport("https://example.com", response, "mobile");

    expect(result.scores.performance).toBe(0);
    expect(result.scores.accessibility).toBe(0);
    expect(result.scores.seo).toBe(0);
  });

  it("handles audits with missing numericValue or displayValue", () => {
    const response = {
      lighthouseResult: {
        categories: {},
        audits: {
          "first-contentful-paint": { displayValue: "1.5 s" },
          "largest-contentful-paint": { numericValue: 2000 },
          "total-blocking-time": {},
        },
      },
    };
    const result = parseReport("https://example.com", response, "desktop");

    // Missing numericValue -> 0
    expect(result.coreWebVitals.fcp).toEqual({ value: 0, displayValue: "1.5 s" });
    // Missing displayValue -> "N/A"
    expect(result.coreWebVitals.lcp).toEqual({ value: 2000, displayValue: "N/A" });
    // Both missing -> defaults
    expect(result.coreWebVitals.tbt).toEqual({ value: 0, displayValue: "N/A" });
  });

  it("rounds scores correctly", () => {
    const response = {
      lighthouseResult: {
        categories: {
          performance: { score: 0.895 }, // rounds to 90
          accessibility: { score: 0.494 }, // rounds to 49
        },
        audits: {},
      },
    };
    const result = parseReport("https://example.com", response, "desktop");

    expect(result.scores.performance).toBe(90);
    expect(result.scores.accessibility).toBe(49);
  });

  it("handles zero scores correctly", () => {
    const response = {
      lighthouseResult: {
        categories: {
          performance: { score: 0 },
        },
        audits: {},
      },
    };
    const result = parseReport("https://example.com", response, "mobile");

    expect(result.scores.performance).toBe(0);
  });
});
