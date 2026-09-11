import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { isPushSupported, subscribePush, unsubscribePush, getExistingSubscription } from "@/lib/push";
import { useRegisterBrowserPush } from "@/features/notifications/hooks/usePushSubscription";
import { showToast } from "@/components/ui/showToast";

export function PushOptIn() {
  const vapidPublic = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  const [supported] = useState(() => isPushSupported());
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unknown">(
    typeof Notification !== "undefined" ? Notification.permission : "unknown",
  );
  const register = useRegisterBrowserPush();

  useEffect(() => {
    getExistingSubscription().then((s) => setSubscribed(!!s)).catch(() => {});
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  if (!supported || !vapidPublic) return null;

  const handleEnable = async () => {
    setLoading(true);
    try {
      const json = await subscribePush(vapidPublic);
      await register.mutateAsync(json);
      setSubscribed(true);
      setPermission("granted");
      showToast({ type: "success", title: "Notifikasi OS diaktifkan", message: "Kamu akan dapat push saat app tertutup" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast({ type: "error", title: "Gagal aktifkan notifikasi", message: msg });
      setPermission(typeof Notification !== "undefined" ? Notification.permission : "unknown");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await unsubscribePush();
      setSubscribed(false);
      showToast({ type: "success", title: "Notifikasi OS dimatikan" });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed || permission === "granted") {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <Bell size={16} /> Push aktif
        </span>
        <button
          onClick={() => void handleDisable()}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-50 disabled:opacity-60"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <BellOff size={12} />} Matikan
        </button>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        Notifikasi diblokir di browser. Buka Settings → Notifications → Allow untuk Voks.
      </div>
    );
  }

  return (
    <button
      onClick={() => void handleEnable()}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bda752] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#a8913f] active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
      Aktifkan Notifikasi OS
    </button>
  );
}
