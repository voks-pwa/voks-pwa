import { useEffect, useState } from "react";
import { X, CheckCircle2, Trophy, AlertCircle } from "lucide-react";
import type { ToastType } from "./showToast";
import { registerToastHandler } from "./showToast";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  reward?: number;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unregister = registerToastHandler((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    });
    return unregister;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="w-80 animate-slide-in rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {t.type === "success" && (
                <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-green-500" />
              )}
              {t.type === "reward" && (
                <Trophy size={22} className="mt-0.5 shrink-0 text-yellow-500" />
              )}
              {t.type === "error" && (
                <AlertCircle size={22} className="mt-0.5 shrink-0 text-red-500" />
              )}
              {t.type === "info" && (
                <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-blue-500" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                {t.message && (
                  <p className="mt-0.5 text-xs text-gray-500">{t.message}</p>
                )}
                {t.reward != null && t.reward > 0 && (
                  <p className="mt-1 text-sm font-bold text-[#bda752]">
                    +{t.reward} VXP
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
