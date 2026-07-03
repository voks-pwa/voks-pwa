import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useProfile } from "@/hooks/useProfile";
import { getAdminPermissions } from "../shared/permissions";

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

if (!profile) {
  return (
    <div className="flex h-screen items-center justify-center">
      Profile not found
    </div>
  );
}

const permissions = getAdminPermissions(profile.role);

if (!permissions.length) {
  return <Navigate to="/" replace />;
}

return <>{children}</>;
}