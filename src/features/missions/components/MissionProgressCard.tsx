import { MissionCountdown } from "./MissionCountdown"
import { MissionProgressBar } from "./MissionProgressBar"

interface MissionProgressCardProps {
  title: string
  progress: number
  target: number
  completed: boolean
}

export function MissionProgressCard({
  title,
  progress,
  target,
  completed,
}: MissionProgressCardProps) {
  return (
    /* Efek Neumorphism Utama: 
      Menggunakan kombinasi warna bg-gray-50/80 dengan dua bayangan (shadow) kustom 
      yaitu bayangan gelap halus di kanan-bawah dan bayangan putih terang di kiri-atas.
    */
    <div className="rounded-[28px] bg-gray-50/80 p-5 border border-white/40 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,1)] transition-all duration-300">
      
      {/* JUDUL MISI DENGAN TIPOGRAFI SLIM */}
      <div className="mb-3.5 px-1">
        <h3 className="text-base font-extrabold text-gray-700 tracking-tight">
          {title}
        </h3>
      </div>

      {/* BILAH PROGRES */}
      <div className="px-0.5">
        <MissionProgressBar
          progress={progress}
          target={target}
          completed={completed}
        />
      </div>

      {/* HITUNG MUNDUR (JIKA BELUM SELESAI) */}
      {!completed && (
        <div className="mt-4 px-1 text-xs text-gray-400 font-medium">
          <MissionCountdown
            progress={progress}
            target={target}
          />
        </div>
      )}

      {/* POPUP SELESAI (JIKA SUDAH SELESAI) */}
      {completed && (
        /* Status Selesai Neumorphism: Efek Cekung ke Dalam (Inset/Concave) */
        <div className="mt-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/40 p-3 text-center text-xs font-bold text-emerald-600 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] tracking-wide uppercase">
          ✦ Mission Completed 🎉
        </div>
      )}

    </div>
  )
}