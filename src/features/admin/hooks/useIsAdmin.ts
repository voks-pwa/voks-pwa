import { useProfile } from "@/hooks/useProfile";

export function useIsAdmin() {

  const { data: profile } =
    useProfile();

  return {

    isAdmin:
      profile?.role === "admin" ||
      profile?.role === "superadmin",

    loading: !profile,

  };

}