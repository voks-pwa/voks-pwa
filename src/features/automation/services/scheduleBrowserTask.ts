import { scheduleJob } from "./automationEngine";

export async function scheduleBrowserTask(
  task: string,
  runAt: Date | string,
  options?: { referenceId?: string; payload?: Record<string, unknown> }
) {
  return scheduleJob("BROWSER_AUTOMATION", runAt, {
    referenceId: options?.referenceId,
    payload: { task, ...options?.payload },
  });
}
