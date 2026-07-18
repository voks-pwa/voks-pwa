import { Link } from "react-router-dom";
import { ChevronLeft, Radio, Music, Calendar } from "lucide-react";
import { LiveStudioPlayer } from "@/components/live/LiveStudioPlayer";
import { LiveChat } from "@/features/live/components/LiveChat";
import { useLivePresence } from "@/features/live/hooks/useLivePresence";
import { useCurrentProgram } from "@/hooks/useCurrentProgram";
import { useAuth } from "@/features/auth/useAuth";

export function LiveStudioPage() {
  const { user } = useAuth();
  const currentProgram = useCurrentProgram();
  const { viewerCount } = useLivePresence(user?.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link
        to="/"
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
      >
        <ChevronLeft size={18} />
        Home
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <LiveStudioPlayer viewerCount={viewerCount} />

          {currentProgram && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {currentProgram._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                  <img
                    src={currentProgram._embedded["wp:featuredmedia"][0].source_url}
                    alt={currentProgram.title.rendered}
                    className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="inline-block rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    ON AIR NOW
                  </span>
                  <h2 className="mt-1.5 text-lg font-bold text-gray-900">
                    {currentProgram.title.rendered}
                  </h2>
                  {currentProgram.acf?.host && (
                    <p className="text-sm text-gray-500">{currentProgram.acf.host}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    {currentProgram.acf?.jadwal_hari && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {currentProgram.acf.jadwal_hari}
                      </span>
                    )}
                    {currentProgram.acf?.jam_siaran && (
                      <span className="flex items-center gap-1">
                        <Music size={12} />
                        {currentProgram.acf.jam_siaran}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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

        <div className="h-[600px] lg:h-auto">
          <LiveChat />
        </div>
      </div>
    </div>
  );
}
