import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { Link } from "react-router-dom";

interface GuestGuardProps {
  children: ReactNode;
  message?: string;
}

export function GuestGuard({
  children,
  message = "Sign in to access this feature",
}: GuestGuardProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-gray-50 px-6 py-8 text-center">
        <p className="text-sm text-gray-500">{message}</p>
        <Link
          to="/login"
          className="rounded-xl bg-[#bda752] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a8913f]"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
