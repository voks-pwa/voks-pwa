import { ArrowLeft, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { MissionHeader } from "@/features/missions/components/MissionHeader";
import { MissionList } from "@/features/missions/components/MissionList";
import { MissionHistory } from "@/features/missions/components/MissionHistory";

export function MissionsPage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  return (
    <>
        
        {/* ROW TOMBOL KEMBALI DENGAN TULISAN */}
        <div className="mb-4 flex items-center justify-between mt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
            aria-label="Kembali"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 group-hover:bg-gray-50 transition-all">
              <ArrowLeft size={18} />
            </div>
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            {profile && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-100/50">
                {profile.current_vxp} VXP
              </span>
            )}
            {/* JALAN PINTAS KE REWARD STORE (IKON GIFT) */}
            <button 
              onClick={() => navigate('/rewards')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-[#bda752] border border-amber-100/50 hover:bg-amber-100/50 transition-colors"
              title="Reward Store"
            >
              <Gift size={18} />
            </button>
          </div>
        </div>

        <MissionHeader />

        <div className="mt-6">
          <MissionList />
        </div>

        <div className="mt-6">
          <MissionHistory />
        </div>

    </>
  );
}