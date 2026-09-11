import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { Play, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import type { WordPressVoksPlus } from "@/types/voks-plus";

import { Header } from '@/components/layout/Header'
import { BrandHeader } from '@/components/home/BrandHeader'
import { QuickAccess } from '@/components/home/QuickAccess'
import { HostsSlider } from '@/components/home/HostsSlider'
import { AudioPlayerCard } from '@/components/player/AudioPlayerCard'
import { PromoBanner } from '@/components/ui/PromoBanner'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useVoksPlus } from '@/hooks/useVoksPlus'
import { usePrograms } from '@/hooks/usePrograms'

function ProgramsCarousel({ programs }: { programs: import("@/types/program").WordPressProgram[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };
  return (
    <div className="relative mt-5">
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {programs.map((program) => {
          const image =
            program._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium_large?.source_url ??
            program._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
          return (
            <Link
              key={program.id}
              to={`/programs/${program.slug}`}
              className="group w-[240px] shrink-0 snap-start overflow-hidden rounded-xl border-0 bg-white shadow-sm transition-shadow hover:shadow-md md:w-[260px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-200">
                {image && <img src={image} alt={program.title.rendered} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />}
                <button
                  onClick={(e) => { e.preventDefault(); }}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-white"
                  aria-label="Favorite"
                >
                  <Heart size={14} />
                </button>
                {program.acf?.jam_siaran && (
                  <span className="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-800">{program.acf.jam_siaran}</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-gray-900">{program.title.rendered}</h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-1">{program.acf?.host ?? program.acf?.jam_siaran ?? "Voks Radio"}</p>
                <p className="mt-1 text-xs text-gray-400 line-clamp-1">{program.acf?.jadwal_hari ?? "Daily"}</p>
              </div>
            </Link>
          );
        })}
      </div>
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white sm:flex"
      >
        <ChevronLeft size={16} className="text-gray-700" />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white sm:flex"
      >
        <ChevronRight size={16} className="text-gray-700" />
      </button>
    </div>
  );
}

function VoksPlusList({ items }: { items: WordPressVoksPlus[] }) {
  const display = items.slice(0, 8);
  const visible = display.slice(0, 3);
  const hasMore = display.length > 3;
  return (
    <div className="space-y-3">
      <div className={hasMore ? "max-h-[252px] overflow-y-auto pr-1 scrollbar-thin" : ""}>
        <div className="space-y-3">
          {(hasMore ? display : visible).map((item) => {
        const embedded = item._embedded as Record<string, unknown> | undefined;
        const media = (embedded?.["wp:featuredmedia"] as Record<string, unknown>[] | undefined)?.[0];
        const mediaDetails = media?.media_details as Record<string, unknown> | undefined;
        const sizes = mediaDetails?.sizes as Record<string, unknown> | undefined;
        const mediumLarge = sizes?.medium_large as Record<string, unknown> | undefined;
        const image = (mediumLarge?.source_url as string) || (media?.source_url as string) || "";
        const title = (item.title as Record<string, unknown> | undefined)?.rendered as string ?? "";
        const acf = item.acf as Record<string, unknown> | undefined;
        return (
          <Link
            key={String(item.id)}
            to={`/plus/${item.slug}`}
            className="flex gap-3 rounded-2xl bg-gray-50 p-3 ring-1 ring-black/[0.04] transition hover:bg-white hover:shadow-sm hover:ring-black/5"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {image && <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />}
              <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm">
                  <Play size={12} className="ml-0.5 fill-gray-900" />
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-gray-900">{title}</h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{(acf?.guest_name as string) ?? ""}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#bda752] ring-1 ring-[#bda752]/15">
                  {(acf?.content_type as string) ?? "Music"}
                </span>
                <span className="text-xs text-gray-400">{(acf?.duration as string) ?? ""}</span>
              </div>
            </div>
          </Link>
        );
      })}
        </div>
      </div>
    </div>
  );
}

export function VoksPlusSlider({ items }: { items: WordPressVoksPlus[] }) {
  useEffect(() => {
    import("swiper/css");
  }, []);

  return (
    <Swiper modules={[Autoplay]} spaceBetween={16} slidesPerView={1.15}>
      {items.map((item) => {
        const embedded = item._embedded as Record<string, unknown> | undefined;
        const media = (embedded?.["wp:featuredmedia"] as Record<string, unknown>[] | undefined)?.[0];
        const mediaDetails = media?.media_details as Record<string, unknown> | undefined;
        const sizes = mediaDetails?.sizes as Record<string, unknown> | undefined;
        const mediumLarge = sizes?.medium_large as Record<string, unknown> | undefined;
        const image = (mediumLarge?.source_url as string) || (media?.source_url as string) || "";

        const title = item.title as Record<string, unknown> | undefined;
        const acf = item.acf as Record<string, unknown> | undefined;

        return (
          <SwiperSlide key={String(item.id)}>
            <Link to={`/plus/${item.slug}`} className="block">
              <div className="overflow-hidden rounded-3xl bg-gray-50">
                <div className="relative">
                  {image && (
                    <img
                      src={image}
                      alt={(title?.rendered as string) || ""}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                      {acf?.content_type as string}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                    <Play />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-lg font-bold">{(title?.rendered as string) || ""}</h3>
                  <p className="mt-2 text-sm text-gray-600">{acf?.guest_name as string}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">{acf?.duration as string}</span>
                    <span className="text-xs font-semibold text-primary">Watch Now</span>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        )
      })}
    </Swiper>
  );
}

export function HomePage() {
  const { data: voksPlus, isLoading: vpLoading, isError: vpError, refetch: vpRefetch } = useVoksPlus()
  const { data: programs, isLoading: prLoading, isError: prError, refetch: prRefetch } = usePrograms()

  return (
    <>
      <Header />

      <div className="flex w-full flex-col gap-6">
        <BrandHeader />

        <AudioPlayerCard compact highlight />

        <PromoBanner />

        <NotificationCenter />

        <QuickAccess />

        <section className="rounded-3xl bg-white p-6 shadow-sm scroll-mt-24">
          <SectionHeader title="Voks+" label="Premium Content" viewAllLink="/plus" />
          <div className="mt-5">
            {vpLoading && (
              <div className="flex gap-4 overflow-hidden">
                <Skeleton className="h-64 w-[85%] shrink-0 rounded-3xl" />
                <Skeleton className="h-64 w-[85%] shrink-0 rounded-3xl" />
              </div>
            )}
            {vpError && <ErrorState message="Failed to load Voks+ content" onRetry={vpRefetch} />}
            {!vpLoading && !vpError && (!voksPlus || voksPlus.length === 0) && (
              <EmptyState title="No content yet" message="Check back soon for new premium content" />
            )}
            {!vpLoading && !vpError && voksPlus && voksPlus.length > 0 && (
              <VoksPlusList items={voksPlus} />
            )}
          </div>
        </section>

        <section className="scroll-mt-24">
          <SectionHeader title="Programs" label="All Shows" viewAllLink="/programs" />
          {prLoading && (
            <div className="mt-5 flex gap-3 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[240px] shrink-0 overflow-hidden rounded-xl bg-white shadow-sm md:w-[260px]">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-2 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {prError && <ErrorState message="Failed to load programs" onRetry={prRefetch} />}
          {!prLoading && !prError && (!programs || programs.length === 0) && (
            <EmptyState title="No programs yet" message="Check back soon for new shows" />
          )}
          {!prLoading && !prError && programs && programs.length > 0 && <ProgramsCarousel programs={programs.slice(0, 8)} />}
        </section>

        <HostsSlider />
      </div>
    </>
  )
}
