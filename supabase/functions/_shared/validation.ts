import { z } from "npm:zod";

export function parseBody<T>(
  body: string | null,
  schema: z.ZodSchema<T>,
): { success: true; data: T } | { success: false; error: string } {
  if (!body) {
    return { success: false, error: "Request body is empty" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { success: false, error: "Invalid JSON body" };
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }
  return { success: true, data: result.data };
}

export function validationError(
  error: string,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ success: false, error }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
