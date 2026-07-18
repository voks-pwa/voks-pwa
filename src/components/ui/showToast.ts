export type ToastType = "success" | "reward" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  reward?: number;
}

let addToastFn: ((t: ToastItem) => void) | null = null;

export function registerToastHandler(fn: (t: ToastItem) => void) {
  addToastFn = fn;
  return () => { addToastFn = null; };
}

export function showToast(props: Omit<ToastItem, "id">) {
  addToastFn?.({ ...props, id: crypto.randomUUID() });
}
