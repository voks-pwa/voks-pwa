import { useEffect, useState } from "react";

function formatParts(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-black tabular-nums leading-none text-[#bda752] text-2xl sm:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/70">
        {label}
      </span>
    </div>
  );
}

/**
 * Live countdown. Read-only display only — no mission or reward logic.
 * Driven by `timeRemainingMs` from the Campaign Engine.
 */
export function Countdown({
  timeRemainingMs,
  variant = "light",
}: {
  timeRemainingMs: number | null;
  variant?: "light" | "dark";
}) {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    if (timeRemainingMs === null) return;
    const id = setInterval(() => setTicks((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timeRemainingMs]);

  if (timeRemainingMs === null) {
    return (
      <span className="text-sm font-medium text-gray-400">
        No end date
      </span>
    );
  }

  const remaining = Math.max(0, timeRemainingMs - ticks * 1000);
  const { days, hours, minutes, seconds } = formatParts(remaining);
  const sep = variant === "light" ? "text-[#bda752]" : "text-white/50";

  return (
    <div
      className="flex items-center gap-3"
      role="timer"
      aria-label="Time remaining"
    >
      <Unit value={days} label="Days" />
      <span className={`${sep} text-xl font-black`}>:</span>
      <Unit value={hours} label="Hrs" />
      <span className={`${sep} text-xl font-black`}>:</span>
      <Unit value={minutes} label="Min" />
      <span className={`${sep} text-xl font-black`}>:</span>
      <Unit value={seconds} label="Sec" />
    </div>
  );
}
