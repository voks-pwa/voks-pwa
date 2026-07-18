export function BrandHeader() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#5B5B3F] to-[#bda752] p-8 text-white shadow-sm">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          VOKS NEXT
        </h1>

        <span className="hidden rounded-full border border-white/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider sm:inline-block">
          Digital Radio Platform
        </span>
      </div>

      <div className="mt-8 sm:mt-12">
        <p className="text-lg font-bold leading-relaxed sm:text-2xl">
          Listen. Watch.
          <br />
          Discover. Connect.
        </p>
        <p className="mt-2 text-sm text-white/70">
          New Experience · Transformation
        </p>
      </div>
    </section>
  );
}
