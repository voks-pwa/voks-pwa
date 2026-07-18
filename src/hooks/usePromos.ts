import { useQuery } from "@tanstack/react-query";
import { getPromos } from "@/services/wordpress-api";

export function usePromos() {
  return useQuery({
    queryKey: ["promos"],
    queryFn: getPromos,
    staleTime: 5 * 60 * 1000,
  });
}
