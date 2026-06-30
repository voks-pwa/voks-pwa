interface MissionRewardCardProps {
  reward: number
  completed: boolean
  claimed: boolean
  onClaim?: () => void
}

export function MissionRewardCard({
  reward,
  completed,
  claimed,
  onClaim,
}: MissionRewardCardProps) {
  return (
    /* Wadah Utama Neumorphism: Timbul ke atas (Outset) dengan sudut membulat mulus */
    <div className="rounded-[28px] bg-gray-50/80 p-6 border border-white/40 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,1)] transition-all duration-300">

      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
        Reward Point
      </h3>

      {/* Teks Hadiah Angka VXP */}
      <div className="mt-2 px-1 text-3xl font-black text-[#bda752] tracking-tight">
        +{reward} <span className="text-xs font-bold text-gray-400 uppercase tracking-normal">VXP</span>
      </div>

      <div className="mt-6">
        {/* KONDISI A: BELUM SELESAI (Tombol Cekung ke Dalam / Inset Soft UI) */}
        {!completed && (
          <button
            type="button"
            disabled
            className="w-full rounded-2xl bg-gray-100/70 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border border-gray-200/30 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] cursor-not-allowed"
          >
            In Progress
          </button>
        )}

        {/* KONDISI B: SELESAI & BELUM DIKLAIM (Tombol Timbul Emas Voks Premium) */}
        {completed && !claimed && (
          <button
            type="button"
            onClick={onClaim}
            className="w-full rounded-2xl bg-[#bda752] py-3 text-xs font-bold text-white uppercase tracking-wider border border-[#dfc76c]/40 shadow-[4px_4px_10px_rgba(189,167,82,0.3),_-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-[#a69243] active:scale-[0.98] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-200"
          >
            Claim Reward
          </button>
        )}

        {/* KONDISI C: SUDAH DIKLAIM (Tombol Cekung Hijau Emerald) */}
        {claimed && (
          <button
            type="button"
            disabled
            className="w-full rounded-2xl bg-emerald-50/60 py-3 text-xs font-bold text-emerald-600 uppercase tracking-wider border border-emerald-100/40 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.15),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] cursor-not-allowed"
          >
            ✓ Claimed
          </button>
        )}
      </div>

    </div>
  )
}