import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { track } from "@/core/action-engine";

const SKIP_PREFIXES = ["/admin", "/dev"];

export function PageViewTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (SKIP_PREFIXES.some((p) => location.pathname.startsWith(p))) return;
    if (location.pathname === lastPathRef.current) return;

    lastPathRef.current = location.pathname;

    track("PAGE_VIEW", user.id, {
      path: location.pathname,
      page: location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, [location.pathname, user]);

  return null;
}
