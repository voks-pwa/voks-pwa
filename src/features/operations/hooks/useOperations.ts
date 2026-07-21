import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSystemHealth,
  getFeatureFlags,
  updateFeatureFlag,
  getMaintenanceConfig,
  updateMaintenanceConfig,
  getAppVersion,
  getAuditLogs,
} from "../repositories/operationsRepository";
import { operationsKeys } from "../queries/operationsQueries";
import type { SystemHealth, FeatureFlag, MaintenanceConfig, AppVersion, AuditLogEntry } from "../types";

export function useSystemHealth() {
  return useQuery<SystemHealth>({
    queryKey: operationsKeys.health(),
    queryFn: getSystemHealth,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useFeatureFlags() {
  return useQuery<FeatureFlag[]>({
    queryKey: operationsKeys.featureFlags(),
    queryFn: getFeatureFlags,
    staleTime: 30_000,
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation<FeatureFlag, Error, { key: string; enabled: boolean }>({
    mutationFn: ({ key, enabled }) => updateFeatureFlag(key, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.featureFlags() });
    },
  });
}

export function useMaintenanceConfig() {
  return useQuery<MaintenanceConfig>({
    queryKey: operationsKeys.maintenance(),
    queryFn: getMaintenanceConfig,
    staleTime: 30_000,
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MaintenanceConfig>({
    mutationFn: updateMaintenanceConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.maintenance() });
    },
  });
}

export function useAppVersion() {
  return useQuery<AppVersion>({
    queryKey: operationsKeys.version(),
    queryFn: getAppVersion,
    staleTime: 300_000,
  });
}

export function useAuditLogs(limit: number = 50) {
  return useQuery<AuditLogEntry[]>({
    queryKey: operationsKeys.auditLogs(limit),
    queryFn: () => getAuditLogs(limit),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}
