import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/useAuth";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return fallback ?? null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
