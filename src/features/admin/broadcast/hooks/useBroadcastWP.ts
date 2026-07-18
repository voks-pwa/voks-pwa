import { useQuery } from "@tanstack/react-query";

import { listWPNotifications } from "../api/broadcast-wp";

export function useWPNotifications() {
  return useQuery({
    queryKey: ["admin-broadcast-wp"],
    queryFn: listWPNotifications,
    staleTime: 120_000,
  });
}
