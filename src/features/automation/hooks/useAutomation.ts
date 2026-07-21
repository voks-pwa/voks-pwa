import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getScheduledJobs,
  getQueueItems,
  getDeadItems,
  scheduleJob,
  enqueueNotification,
  requeueDead,
  processDueJobs,
  processNotificationQueue,
} from "../services/automationEngine";
import type { JobType, NotificationChannel } from "../types";

export function useScheduledJobs() {
  return useQuery({
    queryKey: ["scheduled-jobs"],
    queryFn: getScheduledJobs,
    staleTime: 30_000,
  });
}

export function useNotificationQueue() {
  return useQuery({
    queryKey: ["notification-queue"],
    queryFn: getQueueItems,
    staleTime: 30_000,
  });
}

export function useDeadQueue() {
  return useQuery({
    queryKey: ["dead-queue"],
    queryFn: getDeadItems,
    staleTime: 30_000,
  });
}

export function useScheduleJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      jobType: JobType;
      runAt: Date | string;
      referenceId?: string;
      payload?: Record<string, unknown>;
      maxAttempts?: number;
    }) => scheduleJob(args.jobType, args.runAt, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-jobs"] });
    },
  });
}

export function useEnqueueNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      channel: NotificationChannel;
      title: string;
      message: string;
      userId?: string;
      templateKey?: string;
      imageUrl?: string;
      deepLink?: string;
      payload?: Record<string, unknown>;
    }) => enqueueNotification(args.channel, args.title, args.message, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-queue"] });
    },
  });
}

export function useRequeueDead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requeueDead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dead-queue"] });
    },
  });
}

export function useProcessJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (limit?: number) => processDueJobs(limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-jobs"] });
    },
  });
}

export function useProcessQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (limit?: number) => processNotificationQueue(limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dead-queue"] });
    },
  });
}
