import { Trophy } from "lucide-react";
import { useMissionStatistics } from "@/hooks/useMissionStatistics";

export function MissionHeader() {
  const stats = useMissionStatistics();

  return (
    <div
      className="
      rounded-3xl
      bg-linear-to-br
      from-[#5d5b3d]
      via-[#887845]
      to-[#bda752]
      p-6
      text-white
      shadow
    "
    >
      <div className="flex items-center gap-4">
        <div
          className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-white/20
        "
        >
          <Trophy size={28} />
        </div>

        <div>
          <h1 className="text-3xl font-black">
            Mission Center
          </h1>

          <p className="mt-1 text-white/80">
            Complete missions and earn VXP.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-4">

        <div
          className="
          flex-1
          rounded-2xl
          bg-white/15
          p-4
        "
        >
          <p className="text-xs uppercase text-white/70">
            Total
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {stats.total}
          </h2>

        </div>

        <div
          className="
          flex-1
          rounded-2xl
          bg-white/15
          p-4
        "
        >
          <p className="text-xs uppercase text-white/70">
            Completed
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {stats.completed}
          </h2>

        </div>

        <div
          className="
          flex-1
          rounded-2xl
          bg-white/15
          p-4
        "
        >
          <p className="text-xs uppercase text-white/70">
            Claimed
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {stats.claimed}
          </h2>

        </div>

      </div>
    </div>
  );
}