import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Trophy, Clock, Repeat, Target, CheckCircle2,
  AlertCircle, Loader2, Gift, Star, History, Share2,
} from "lucide-react";
import { useMission } from "@/hooks/useMission";
import { useMissionProgressFor } from "@/hooks/useMissionProgressFor";
import { useMissionClaim } from "@/hooks/useMissionClaim";
import { useShareMission } from "@/features/missions/hooks/useShareMission";
import { isShareMission } from "@/features/missions/services/missionRules";
import { isAutoClaimMission } from "@/features/missions/validators";
import { deriveMissionState } from "@/features/missions/services/missionStateMachine";
import { useAuth } from "@/features/auth/useAuth";
import { MissionProgressBar } from "@/features/missions/components/MissionProgressBar";

export function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const missionId = id ? Number(id) : undefined;
  const { user } = useAuth();
  const { data: mission, isLoading, isError } = useMission(missionId);
  const { data: progress } = useMissionProgressFor(missionId);
  const claim = useMissionClaim();
  const { share, isSharing } = useShareMission();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#bda752]" />
      </div>
    );
  }

  if (isError || !mission) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-lg font-semibold text-gray-700">Mission not found</p>
        <Link to="/missions" className="rounded-xl bg-[#bda752] px-6 py-2.5 text-sm font-semibold text-white">
          Back to Missions
        </Link>
      </div>
    );
  }

  const state = deriveMissionState(mission, progress ?? null);
  const isGuest = !user;
  const isInProgress = state === "IN_PROGRESS";
  const isReadyToClaim = state === "READY_TO_CLAIM";
  const isClaimed = state === "CLAIMED";
  const autoClaim = isAutoClaimMission(mission);
  const target = mission.durationMinutes ? mission.durationMinutes * 60 : mission.target ?? 0;
  const current = progress?.progress ?? 0;
  const hasProgress = !!progress;

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="rounded-2xl bg-linear-to-br from-[#5d5b3d] via-[#887845] to-[#bda752] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
            <Trophy size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{mission.title}</h1>
            {mission.badge && (
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                {mission.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-gray-600">{mission.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500"><Target size={14} /><span>Target</span></div>
          <p className="mt-1 text-sm font-bold text-gray-800">{target} {mission.durationMinutes ? "seconds" : "points"}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500"><Gift size={14} /><span>Reward</span></div>
          <p className="mt-1 text-sm font-bold text-[#bda752]">+{mission.reward} VXP</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500"><Clock size={14} /><span>Type</span></div>
          <p className="mt-1 text-sm font-bold text-gray-800 capitalize">{mission.type || mission.listenMode || "Standard"}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500"><Repeat size={14} /><span>Repeat</span></div>
          <p className="mt-1 text-sm font-bold text-gray-800">{mission.repeat ? "Repeatable" : "One-time"}</p>
        </div>
      </div>

      {mission.campaignSlug && (
        <div className="mt-3 rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500"><Trophy size={14} /><span>Campaign</span></div>
          <p className="mt-1 text-sm font-bold text-gray-800 capitalize">{mission.campaignSlug}</p>
        </div>
      )}

      {hasProgress && (
        <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-700">Progress</h3>
          <MissionProgressBar progress={current} target={target} completed={isReadyToClaim} />
          {progress?.updated_at && (
            <p className="mt-2 text-xs text-gray-400">
              Last updated: {new Date(progress.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="mt-6">
        {isGuest ? (
          <Link to="/auth/login?redirect=/missions" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-200 py-3.5 text-base font-bold text-gray-600 transition hover:bg-gray-300">
            Login to View Missions
          </Link>
        ) : isClaimed ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-50 py-3.5 text-base font-bold text-green-600 border border-green-200">
            <CheckCircle2 size={18} /> Completed
          </div>
        ) : isReadyToClaim ? (
          autoClaim ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-50 py-3.5 text-base font-bold text-green-600 border border-green-200">
              <CheckCircle2 size={18} /> Completed
            </div>
          ) : (
            <button
              onClick={() => claim.mutate(mission.id)}
              disabled={claim.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bda752] py-3.5 text-base font-bold text-white transition hover:bg-[#a8913f] active:scale-[0.98] disabled:opacity-60"
            >
              {claim.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gift size={18} />}
              {claim.isPending ? "Claiming..." : "Claim Reward"}
            </button>
          )
        ) : isInProgress ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-50 py-3.5 text-base font-bold text-amber-700 border border-amber-200">
            <Loader2 className="h-5 w-5 animate-spin" /> In Progress
          </div>
        ) : isShareMission(mission) ? (
          <button
            onClick={() => share(mission.id)}
            disabled={isSharing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bda752] py-3.5 text-base font-bold text-white transition hover:bg-[#a8913f] active:scale-[0.98] disabled:opacity-60"
          >
            {isSharing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 size={18} />}
            {isSharing ? "Sharing..." : "Share Now"}
          </button>
        ) : (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-50 py-3.5 text-base font-bold text-amber-700 border border-amber-200">
            <Star size={18} /> Available
          </div>
        )}
      </div>

      {claim.isError && (
        <p className="mt-3 text-center text-sm text-red-500">{(claim.error as Error)?.message ?? "Failed to claim"}</p>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <History size={16} className="text-[#bda752]" />
          <h2 className="text-sm font-bold text-gray-700">History</h2>
        </div>
        {progress?.claimed ? (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{mission.title}</p>
                <p className="text-xs text-gray-400">{progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : ""}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <CheckCircle2 size={14} /> Claimed
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Complete and claim to see history.</p>
        )}
      </section>
    </div>
  );
}
