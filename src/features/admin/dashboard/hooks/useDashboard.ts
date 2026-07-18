import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,

    staleTime: 30000,

    refetchInterval: 30000,

    retry: 2,
  });
}