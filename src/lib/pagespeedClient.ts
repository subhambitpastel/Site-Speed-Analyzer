const PSI_API_URL =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

const API_KEY = process.env.NEXT_PUBLIC_PSI_API_KEY || "";

const TIMEOUT_MS = 60_000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 10_000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches a raw PageSpeed Insights report for the given URL and strategy.
 * Uses the public endpoint (no API key required).
 * Retries up to 3 times with exponential backoff on rate-limit (429) errors.
 */
export async function fetchReport(
  url: string,
  strategy: "mobile" | "desktop",
  signal?: AbortSignal,
): Promise<any> {
  const params: Record<string, string> = { url, strategy };
  if (API_KEY) {
    params.key = API_KEY;
  }
  const queryString =
    new URLSearchParams(params).toString() +
    "&category=performance&category=accessibility&category=seo&category=best-practices";

  const endpoint = `${PSI_API_URL}?${queryString}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutId);
        controller.abort();
      } else {
        signal.addEventListener("abort", () => controller.abort(), { once: true });
      }
    }

    try {
      const response = await fetch(endpoint, { signal: controller.signal });

      if (!response.ok) {
        const body = await response.text().catch(() => "");

        if (response.status === 429) {
          lastError = new Error(
            "Rate limit exceeded. Please wait a moment and try again.",
          );
          clearTimeout(timeoutId);
          if (attempt < MAX_RETRIES) {
            const retryDelay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            await wait(retryDelay);
            continue;
          }
          throw lastError;
        }

        if (response.status === 400) {
          throw new Error(
            `Invalid request — the URL may be unreachable or malformed. Details: ${body}`,
          );
        }

        if (response.status >= 500) {
          throw new Error(
            `PageSpeed Insights service error (${response.status}). Try again later.`,
          );
        }

        throw new Error(
          `PageSpeed Insights request failed with status ${response.status}: ${body}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === "AbortError") {
        if (signal?.aborted) {
          throw new DOMException("The operation was aborted.", "AbortError");
        }
        throw new Error(
          `Request timed out after ${TIMEOUT_MS / 1000}s. The target site may be slow or unresponsive.`,
        );
      }

      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch")
      ) {
        throw new Error(
          "Network error — unable to reach the PageSpeed Insights API. Check your internet connection.",
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error("Failed to fetch report after retries.");
}
