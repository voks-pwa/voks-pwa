/**
 * Sponsor section — read-only display of the campaign sponsor.
 */
export function SponsorSection({ sponsorName }: { sponsorName: string | null }) {
  if (!sponsorName) return null;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Presented by
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 font-black text-[#bda752]">
          {sponsorName.charAt(0).toUpperCase()}
        </div>
        <p className="font-bold text-gray-900">{sponsorName}</p>
      </div>
    </section>
  );
}
