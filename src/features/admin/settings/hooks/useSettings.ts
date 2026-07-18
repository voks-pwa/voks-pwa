import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSettings, updateProfile, updateSettings } from "../api/settings";

import type { AdminProfile, PlatformSettings } from "../types/settings";

export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettings,
    staleTime: 120_000,
    retry: false,
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData<{ profile: AdminProfile; settings: PlatformSettings }>(
        ["admin-settings"],
        (old) => (old ? { ...old, profile } : undefined)
      );
    },
  });

  const settingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData<{ profile: AdminProfile; settings: PlatformSettings }>(
        ["admin-settings"],
        (old) => (old ? { ...old, settings } : undefined)
      );
    },
  });

  return {
    profile: query.data?.profile ?? null,
    settings: query.data?.settings ?? null,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: profileMutation.mutateAsync,
    isUpdatingProfile: profileMutation.isPending,
    updateSettings: settingsMutation.mutateAsync,
    isUpdatingSettings: settingsMutation.isPending,
  };
}
