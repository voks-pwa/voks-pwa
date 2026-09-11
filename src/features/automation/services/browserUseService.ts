import { BrowserUse } from "browser-use-sdk";

export interface BrowserTaskResult {
  success: boolean;
  output?: string;
  error?: string;
  sessionId?: string;
}

export async function executeBrowserTask(
  task: string,
  options?: { apiKey?: string }
): Promise<BrowserTaskResult> {
  try {
    const apiKey = options?.apiKey || import.meta.env.VITE_BROWSER_USE_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: "BROWSER_USE_API_KEY not configured",
      };
    }

    const client = new BrowserUse({ apiKey });
    const result = await client.run(task);

    return {
      success: true,
      output: result.output,
      sessionId: result.sessionId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
