import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifyInApp, notifyPush, notifyEmail, enqueueNotification } from "@/features/automation/services/automationEngine";
import type { NotificationChannel } from "@/features/automation/types";

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      channel: NotificationChannel;
      userId?: string;
      title: string;
      message: string;
      templateKey?: string;
      imageUrl?: string;
      deepLink?: string;
      payload?: Record<string, unknown>;
    }) => {
      if (args.channel === "IN_APP") return notifyInApp(args.userId ?? "", args.title, args.message, args);
      if (args.channel === "PUSH") return notifyPush(args.userId ?? "", args.title, args.message, args);
      if (args.channel === "EMAIL") return notifyEmail(args.userId ?? "", args.title, args.message, args);
      return enqueueNotification(args.channel, args.title, args.message, args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
    },
  });
}
