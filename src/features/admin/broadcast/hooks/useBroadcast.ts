import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBroadcast,
  listBroadcasts,
  sendBroadcast,
} from "../api/broadcast";

export function useBroadcasts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-broadcasts"],
    queryFn: listBroadcasts,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-broadcasts"],
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: sendBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-broadcasts"],
      });
    },
  });

  return {
    broadcasts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    send: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
}
