import { useQuery } from "@tanstack/react-query";
import { getPromo } from "@/services/wordpress-api";

export function usePromo(slug?: string) {
  return useQuery({
    queryKey: ["promo", slug],
    queryFn: () => getPromo(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}
