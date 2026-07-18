import {
  getMissionProgressByMissionIds,
  getMissionCompletionsByMissionIds,
  getCampaignIdBySlug,
  getCampaignRewardCount,
} from "../repositories/campaignStatsRepository";

export interface CampaignStats {
  participants: number;
  missionCount: number;
  completedCount: number;
  completionRate: number;
  xpIssued: number;
  rewardDistributed: number;
}

export async function getCampaignStats(
  missionIds: number[],
  campaignSlug: string,
): Promise<CampaignStats> {
  const missionCount = missionIds.length;

  if (missionCount === 0) {
    return {
      participants: 0,
      missionCount: 0,
      completedCount: 0,
      completionRate: 0,
      xpIssued: 0,
      rewardDistributed: 0,
    };
  }

  const [progressRows, completionRows] = await Promise.all([
    getMissionProgressByMissionIds(missionIds),
    getMissionCompletionsByMissionIds(missionIds),
  ]);

  const participants = new Set(progressRows.map((r) => r.user_id)).size;

  const perUserMissions = new Map<string, Set<number>>();
  for (const row of progressRows) {
    if (!perUserMissions.has(row.user_id)) {
      perUserMissions.set(row.user_id, new Set());
    }
    perUserMissions.get(row.user_id)!.add(row.mission_id);
  }

  let completedCount = 0;
  for (const missions of perUserMissions.values()) {
    if (missions.size >= missionCount) {
      completedCount += 1;
    }
  }

  const completionRate = participants > 0
    ? completedCount / participants
    : 0;

  const xpIssued = completionRows.reduce(
    (sum, row) => sum + row.reward_vxp,
    0,
  );

  let rewardDistributed = 0;
  const campaignId = await getCampaignIdBySlug(campaignSlug);
  if (campaignId !== null) {
    rewardDistributed = await getCampaignRewardCount(campaignId);
  }

  return {
    participants,
    missionCount,
    completedCount,
    completionRate,
    xpIssued,
    rewardDistributed,
  };
}
