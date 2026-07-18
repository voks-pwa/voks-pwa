import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCampaigns,
  getAdminCampaignBySlug,
  getCampaignMissions,
  getCampaignTimeline,
  syncCampaignFromWP,
  updateCampaignFeatured,
  updateCampaignPriority,
  getCampaignAnalytics,
} from "../api/campaigns";
import type { AdminCampaignsParams, AdminCampaign } from "../types";

export function useAdminCampaigns(params: AdminCampaignsParams = {}) {
  return useQuery({
    queryKey: ["admin-campaigns", params],
    queryFn: () => getAdminCampaigns(params),
    staleTime: 30000,
  });
}

export function useAdminCampaign(slug: string | undefined) {
  return useQuery({
    queryKey: ["admin-campaign", slug],
    enabled: !!slug,
    queryFn: () => getAdminCampaignBySlug(slug!),
    staleTime: 30000,
  });
}

export function useCampaignMissions(campaignSlug: string | undefined) {
  return useQuery({
    queryKey: ["admin-campaign-missions", campaignSlug],
    enabled: !!campaignSlug,
    queryFn: () => getCampaignMissions(campaignSlug!),
    staleTime: 60000,
  });
}

export function useCampaignTimeline(campaign: AdminCampaign | null | undefined) {
  return useQuery({
    queryKey: ["admin-campaign-timeline", campaign?.slug],
    enabled: !!campaign,
    queryFn: () => getCampaignTimeline(campaign!),
    staleTime: 60000,
  });
}

export function useCampaignAnalytics(campaignSlug: string | undefined) {
  return useQuery({
    queryKey: ["admin-campaign-analytics", campaignSlug],
    enabled: !!campaignSlug,
    queryFn: () => getCampaignAnalytics(campaignSlug!),
    staleTime: 60000,
  });
}

export function useSyncCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => syncCampaignFromWP(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-campaign", slug] });
    },
  });
}

export function useToggleFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, featured }: { slug: string; featured: boolean }) =>
      updateCampaignFeatured(slug, featured),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-campaign", slug] });
    },
  });
}

export function useUpdatePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, priority }: { slug: string; priority: number }) =>
      updateCampaignPriority(slug, priority),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-campaign", slug] });
    },
  });
}