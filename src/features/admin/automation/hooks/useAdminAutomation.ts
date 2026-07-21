import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getScheduledJobs,
  getQueueItems,
  getDeadItems,
  requeueDead,
} from "@/features/automation/services/automationEngine";

export function useAdminScheduledJobs() {
  return useQuery({
    queryKey: ["admin-scheduled-jobs"],
    queryFn: getScheduledJobs,
    staleTime: 30_000,
  });
}

export function useAdminQueue() {
  return useQuery({
    queryKey: ["admin-queue"],
    queryFn: getQueueItems,
    staleTime: 30_000,
  });
}

export function useAdminDeadQueue() {
  return useQuery({
    queryKey: ["admin-dead-queue"],
    queryFn: getDeadItems,
    staleTime: 30_000,
  });
}

export function useAdminRequeueDead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requeueDead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dead-queue"] });
    },
  });
}
