import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useProfile } from "@/hooks/useProfile";

interface Props {
  children: ReactNode;
}

export function AdminProtectedRoute({
  children,
}: Props) {
  const {
    data: profile,
    isLoading,
  } = useProfile();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}