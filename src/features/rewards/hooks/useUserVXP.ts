import { useCanonicalUser } from "@/features/profile/hooks/useCanonicalUser";

export function useUserVXP() {
  const { data } = useCanonicalUser();

  return {
    data: data?.current_vxp ?? 0,
    isLoading: false,
  };
}
