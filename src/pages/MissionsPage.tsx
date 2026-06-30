import { ArrowLeft, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MissionHeader } from "@/features/missions/components/MissionHeader";
import { MissionStatistics } from "@/features/missions/components/MissionStatistics";
import { MissionList } from "@/features/missions/components/MissionList";
import { MissionHistory } from "@/features/missions/components/MissionHistory";

export function MissionsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        
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

          {/* JALAN PINTAS KE REWARD STORE (IKON GIFT) */}
          <button 
            onClick={() => navigate('/rewards')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-[#bda752] border border-amber-100/50 hover:bg-amber-100/50 transition-colors"
            title="Reward Store"
          >
            <Gift size={18} />
          </button>
        </div>

        {/* SECTION HEADER UTAMA MISI */}
        <div className="mb-6">
          <MissionHeader />
        </div>

        {/* SECTION STATISTIK */}
        <div className="mt-6">
          <MissionStatistics />
        </div>

        {/* SECTION DAFTAR MISI */}
        <div className="mt-6">
          <MissionList />
        </div>

        {/* SECTION RIWAYAT KLAIM MISI */}
        <div className="mt-6">
          <MissionHistory />
        </div>

      </div>
    </div>
  );
}