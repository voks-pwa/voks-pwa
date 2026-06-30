import { History } from "lucide-react";
import { useMissionStore } from "../missionStore";

export function MissionHistory() {
  const progress =
    useMissionStore(
      state => state.progress
    );

  const history =
    Object.values(progress)
      .filter(
        item =>
          item.completed
      )
      .reverse();

  return (
    <section className="mt-10">

      <div className="mb-4 flex items-center gap-2">

        <History
          size={18}
          className="text-[#bda752]"
        />

        <h2 className="font-bold">
          Mission History
        </h2>

      </div>

      <div className="space-y-3">

        {history.length === 0 && (

          <div className="rounded-2xl bg-white p-6 text-center text-gray-400 shadow-sm">

            No completed missions.

          </div>

        )}

        {history.map(item => (

          <div
            key={item.missionId}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >

            <div className="flex justify-between">

              <span>
                Mission #{item.missionId}
              </span>

              <span className="font-bold text-[#bda752]">
                +{item.reward}
              </span>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}