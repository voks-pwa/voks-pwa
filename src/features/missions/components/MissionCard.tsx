import { Trophy, Gift, Loader2, Clock, Lock, Star, Share2, CheckCircle2, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { useMissionClaim } from "@/hooks/useMissionClaim";
import { useShareMission } from "../hooks/useShareMission";
import { isShareMission } from "../services/missionRules";
import { isAutoClaimMission } from "../validators";
import { deriveMissionState } from "../services/missionStateMachine";
import { getStreak } from "@/features/retention/repositories/streakRepository";
import { track } from "@/core/action-engine";
import type { MissionConfig, MissionProgress } from "../services/missionTypes";
import { MissionProgressBar } from "./MissionProgressBar";

interface Props {
  mission: MissionConfig;
  progress?: MissionProgress;
}

export function MissionCard({ mission, progress }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const claim = useMissionClaim();
  const { share, isSharing } = useShareMission();

  const isCheckin = mission.action === "checkin";

  const { data: streak } = useQuery({
    queryKey: ["streak", user?.id],
    enabled: !!user && isCheckin,
    queryFn: () => getStreak(user!.id, "daily"),
  });

  const state = deriveMissionState(mission, progress ?? null);

  const isNotStarted = state === "NOT_STARTED";
  const isInProgress = state === "IN_PROGRESS";
  const isReadyToClaim = state === "READY_TO_CLAIM";
  const isClaimed = state === "CLAIMED";
  const autoClaim = isAutoClaimMission(mission);
  const target = mission.durationMinutes ? mission.durationMinutes * 60 : mission.target;
  const current = progress?.progress ?? 0;
  const hasProgress = !!progress;

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    claim.mutate(mission.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    share(mission.id);
  };

  const handleCheckin = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate("/login?redirect=/missions");
      return;
    }
    track("CHECKIN", user.id, { date: new Date().toISOString().split("T")[0] });
    queryClient.invalidateQueries({ queryKey: ["missions-progress", user.id] });
  };

  if (isClaimed && !isCheckin) return null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Trophy size={22} className="text-[#bda752]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900">{mission.title}</h3>
            {mission.badge && (
              <span className="mt-0.5 inline-block rounded-full bg-[#bda752]/10 px-2 py-0.5 text-[10px] font-semibold text-[#bda752]">
                {mission.badge}
              </span>
            )}
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{mission.description}</p>
            {isCheckin && user && (
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Flame size={14} /> Streak {streak?.current_streak ?? 0} hari
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Gift size={14} className="text-[#bda752]" />
          <span className="font-bold text-[#bda752]">+{mission.reward}</span>
        </div>
      </div>

      {hasProgress && (
        <div className="mt-4">
          <MissionProgressBar progress={current} target={target} completed={isReadyToClaim} />
        </div>
      )}

      <div className="relative z-10 mt-4 flex items-center justify-between">
        <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500 capitalize">
          {mission.type || mission.listenMode || "Standard"}
        </span>

        <div>
          {isCheckin && isClaimed ? (
            <span className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
              <CheckCircle2 size={14} /> Completed Today
            </span>
          ) : isReadyToClaim ? (
            autoClaim ? (
              <span className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <CheckCircle2 size={14} /> Completed
              </span>
            ) : (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claim.isPending}
                className="flex items-center gap-1.5 rounded-xl bg-[#bda752] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a8913f] active:scale-[0.97] disabled:opacity-60"
              >
                {claim.isPending ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                {claim.isPending ? "Claiming..." : "Claim Reward"}
              </button>
            )
          ) : isInProgress ? (
            <span className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <Clock size={14} /> In Progress
            </span>
          ) : !user ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate("/login?redirect=/missions"); }}
              className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-200"
            >
              Login
            </button>
          ) : isNotStarted ? (
            isCheckin ? (
              <button
                type="button"
                onClick={handleCheckin}
                className="flex items-center gap-1.5 rounded-xl bg-[#bda752] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a8913f] active:scale-[0.97]"
              >
                <CheckCircle2 size={14} /> Check In
              </button>
            ) : isShareMission(mission) ? (
              <button
                type="button"
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center gap-1.5 rounded-xl bg-[#bda752] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a8913f] active:scale-[0.97] disabled:opacity-60"
              >
                {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                {isSharing ? "Sharing..." : "Share Now"}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <Clock size={14} /> Available
              </span>
            )
          ) : (
            <span className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-400">
              <Lock size={14} /> Unavailable
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/missions/${mission.id}`)}
        className="absolute inset-0 z-0 cursor-pointer"
        aria-label={`View ${mission.title}`}
      />
    </div>
  );
}
