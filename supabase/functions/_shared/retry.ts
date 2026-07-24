export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || attempt === retries - 1) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === retries - 1) throw lastError;
    }
    if (attempt < retries - 1) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw lastError ?? new Error("fetchWithRetry exhausted");
}
