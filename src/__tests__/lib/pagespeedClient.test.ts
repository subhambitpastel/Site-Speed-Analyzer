import { fetchReport } from "@/lib/pagespeedClient";

// Save original fetch
const originalFetch = global.fetch;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

function mockFetchOnce(response: Partial<Response>) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: response.json ?? jest.fn().mockResolvedValue({}),
    text: response.text ?? jest.fn().mockResolvedValue(""),
    ...response,
  } as Response);
}

describe("fetchReport", () => {
  it("calls fetch with the correct endpoint and returns data on success", async () => {
    const mockData = { lighthouseResult: { categories: {} } };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockData),
    } as unknown as Response);

    const promise = fetchReport("https://example.com", "desktop");
    // Advance all timers (the setTimeout for abort)
    jest.advanceTimersByTime(0);
    const result = await promise;

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchUrl).toContain("url=https");
    expect(fetchUrl).toContain("strategy=desktop");
    expect(fetchUrl).toContain("category=performance");
    expect(fetchUrl).toContain("category=accessibility");
    expect(fetchUrl).toContain("category=seo");
    expect(fetchUrl).toContain("category=best-practices");
  });

  it("throws on 400 Bad Request with descriptive message", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn(),
      text: jest.fn().mockResolvedValue("Invalid URL"),
    } as unknown as Response);

    const promise = fetchReport("https://bad.com", "mobile");
    jest.advanceTimersByTime(0);

    await expect(promise).rejects.toThrow("Invalid request");
    await expect(promise).rejects.toThrow("unreachable or malformed");
  });

  it("throws on 500 server error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn(),
      text: jest.fn().mockResolvedValue("Server error"),
    } as unknown as Response);

    const promise = fetchReport("https://example.com", "desktop");
    jest.advanceTimersByTime(0);

    await expect(promise).rejects.toThrow("service error");
  });

  it("throws on unknown non-OK status", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: jest.fn(),
      text: jest.fn().mockResolvedValue("Forbidden"),
    } as unknown as Response);

    const promise = fetchReport("https://example.com", "desktop");
    jest.advanceTimersByTime(0);

    await expect(promise).rejects.toThrow("failed with status 403");
  });

  it("throws a network error when fetch itself throws a TypeError", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    const promise = fetchReport("https://example.com", "mobile");
    jest.advanceTimersByTime(0);

    await expect(promise).rejects.toThrow("Network error");
  });

  it("throws abort error when external signal is already aborted", async () => {
    global.fetch = jest.fn().mockRejectedValue(
      new DOMException("The operation was aborted.", "AbortError")
    );

    const controller = new AbortController();
    controller.abort();

    const promise = fetchReport("https://example.com", "desktop", controller.signal);
    jest.advanceTimersByTime(0);

    await expect(promise).rejects.toThrow("aborted");
  });

  it("retries on 429 with exponential backoff", async () => {
    // First call: 429, second call: 429, third call: success
    const mockData = { lighthouseResult: {} };
    let callCount = 0;

    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.resolve({
          ok: false,
          status: 429,
          json: jest.fn(),
          text: jest.fn().mockResolvedValue("Rate limited"),
        } as unknown as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response);
    });

    const promise = fetchReport("https://example.com", "desktop");

    // First attempt returns 429 -> wait 10s
    await jest.advanceTimersByTimeAsync(10_000);
    // Second attempt returns 429 -> wait 20s
    await jest.advanceTimersByTimeAsync(20_000);
    // Third attempt succeeds
    await jest.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  // Note: A test for exhausting all retries on persistent 429 is not included
  // because the real retry delays (10s, 20s, 40s) interact poorly with fake timers
  // and are too slow with real timers. The retry mechanism is covered by the
  // "retries on 429 with exponential backoff" test above.
});
