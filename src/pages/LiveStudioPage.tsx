import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Radio, Music, Calendar, Clock, MessageCircle, Info, List } from "lucide-react";
import { LiveStudioPlayer } from "@/components/live/LiveStudioPlayer";
import { LiveChat } from "@/features/live/components/LiveChat";
import { useLivePresence } from "@/features/live/hooks/useLivePresence";
import { useCurrentProgram } from "@/hooks/useCurrentProgram";
import { usePrograms } from "@/hooks/usePrograms";
import { useAuth } from "@/features/auth/useAuth";
import { buildSchedule } from "@/lib/program-schedule";
import { getProgramScheduleText } from "@/lib/schedule";

type Tab = "chat" | "info" | "schedule";

const TABS = [
  { id: "chat" as Tab, label: "Chat", icon: MessageCircle },
  { id: "info" as Tab, label: "Info", icon: Info },
  { id: "schedule" as Tab, label: "Schedule", icon: List },
];

export function LiveStudioPage() {
  const { user } = useAuth();
  const currentProgram = useCurrentProgram();
  const { data: programs } = usePrograms();
  const { viewerCount } = useLivePresence(user?.id);
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const schedule = useMemo(
    () => (programs ? buildSchedule(programs) : null),
    [programs]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
      <div className="flex items-center justify-between py-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
        >
          <ChevronLeft size={18} />
          Home
        </Link>
        <Link
          to="/programs"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-[#bda752]"
        >
          All Programs
          <Radio size={14} />
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-black shadow-xl">
        <div className="max-h-[40vh] overflow-hidden">
          <LiveStudioPlayer viewerCount={viewerCount} />
        </div>
        {currentProgram && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-8">
            <span className="inline-block rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              ON AIR NOW
            </span>
            <h2 className="mt-1 text-base font-bold text-white">
              {currentProgram.title.rendered}
            </h2>
            {currentProgram.acf?.host && (
              <p className="text-sm text-gray-300">{currentProgram.acf.host}</p>
            )}
          </div>
        )}
      </div>

      <div className="sticky top-0 z-10 -mx-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm sm:mx-0">
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition sm:text-sm ${
                  activeTab === tab.id
                    ? "border-[#bda752] text-[#bda752]"
                    : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "chat" && (
          <div className="h-[500px] lg:h-[600px]">
            <LiveChat />
          </div>
        )}

        {activeTab === "info" && currentProgram && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {currentProgram._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                  <img
                    src={currentProgram._embedded["wp:featuredmedia"][0].source_url}
                    alt={currentProgram.title.rendered}
                    className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900">
                    {currentProgram.title.rendered}
                  </h2>
                  {currentProgram.acf?.host && (
                    <p className="mt-0.5 text-sm text-gray-500">{currentProgram.acf.host}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    {currentProgram.acf?.jadwal_hari && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {currentProgram.acf.jadwal_hari}
                      </span>
                    )}
                    {currentProgram.acf?.jam_siaran && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {currentProgram.acf.jam_siaran}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {currentProgram.content?.rendered && (
                <div
                  className="mt-4 border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-600"
                  dangerouslySetInnerHTML={{ __html: currentProgram.content.rendered }}
                />
              )}
            </div>

            <div className="flex gap-3">
              <Link
                to="/programs"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white p-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:shadow-md"
              >
                <Radio size={18} />
                Programs
              </Link>
              <Link
                to="/plus"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white p-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:shadow-md"
              >
                <Music size={18} />
                Voks+
              </Link>
            </div>
          </div>
        )}

        {activeTab === "info" && !currentProgram && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Radio size={32} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No program info available</p>
          </div>
        )}

        {activeTab === "schedule" && schedule && (
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-bold text-gray-900">Weekly Schedule</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {schedule.programs.map((program, idx) => (
                <div key={idx} className="flex items-start gap-4 px-5 py-4 transition hover:bg-gray-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#bda752]/10">
                    <Radio size={16} className="text-[#bda752]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{program.name}</p>
                    <p className="text-xs text-gray-400">{program.host}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {getProgramScheduleText(program)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "schedule" && !schedule && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Calendar size={32} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">Schedule unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
}
