import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/features/auth/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";

import { getAdminPermissions } from "../shared/permissions";

interface Props {
  children: ReactNode;
}

export function AdminProtectedRoute({
  children,
}: Props) {

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    data: profile,
    isLoading: profileLoading,
  } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  /*
   * Belum login
   */

  if (!user) {

  sessionStorage.setItem(
    "redirectAfterLogin",
    window.location.pathname
  );

  return (
    <Navigate
      to="/login"
      replace
    />
  );
}

  /*
   * Login tapi profile belum ada
   */

  if (!profile) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
   * Permission
   */

  const permissions =
    getAdminPermissions(profile.role);

  if (!permissions.length) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <>{children}</>;
}