export interface ShareContent {
  title: string;
  text: string;
  url: string;
}

export interface ShareResult {
  success: boolean;
  method: "share" | "copy" | null;
}

export async function shareContent(content: ShareContent): Promise<ShareResult> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url,
      });
      return { success: true, method: "share" };
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        // Web Share failed, fall through to clipboard
      } else {
        return { success: false, method: null };
      }
    }
  }

  try {
    await navigator.clipboard.writeText(content.url);
    return { success: true, method: "copy" };
  } catch {
    return { success: false, method: null };
  }
}
