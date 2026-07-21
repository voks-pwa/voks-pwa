import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerPush,
  unregisterPush,
  listMyPushSubscriptions,
  registerBrowserPush,
} from "../services/pushSubscriptionService";

export function useMyPushSubscriptions() {
  return useQuery({
    queryKey: ["my-push-subscriptions"],
    queryFn: listMyPushSubscriptions,
    staleTime: 60_000,
  });
}

export function useRegisterPush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { endpoint: string; p256dh?: string; auth?: string; deviceType?: string }) =>
      registerPush(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-push-subscriptions"] });
    },
  });
}

export function useUnregisterPush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (endpoint: string) => unregisterPush(endpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-push-subscriptions"] });
    },
  });
}

export function useRegisterBrowserPush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscription: PushSubscriptionJSON | null) => registerBrowserPush(subscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-push-subscriptions"] });
    },
  });
}
