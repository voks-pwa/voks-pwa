import { ensureAchievementCatalog } from "./achievementCatalog";
import { setListenMissionId as setAchievementListenId } from "./metricReader";
import { setListenMissionId as setMilestoneListenId } from "./milestoneEngine";
import { getMissions } from "@/services/wordpress-api";
import { mapMission } from "@/features/missions/services/missionMapper";

let bootstrapped = false;
let bootstrapPromise: Promise<void> | null = null;

/**
 * One-time retention bootstrap: seeds the achievement catalog and resolves
 * the listen mission id used by the metric readers. Idempotent.
 */
export async function bootstrapRetention(): Promise<void> {
  if (bootstrapped) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    await ensureAchievementCatalog();

    try {
      const missions = (await getMissions()) as Array<unknown>;
      const mapped = (missions as Array<{ acf?: Record<string, unknown> }>).map(
        (m) => mapMission(m as never),
      );
      const listen = mapped.find((m) => m.action === "listen");
      if (listen) {
        setAchievementListenId(listen.id);
        setMilestoneListenId(listen.id);
      }
    } catch (error) {
      console.error("[RETENTION] bootstrap missions error", error);
    }

    bootstrapped = true;
  })();

  return bootstrapPromise;
}
