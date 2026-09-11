import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAnnouncers } from "@/hooks/useAnnouncers";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function HostsSlider() {
  const { data: announcers, isLoading } = useAnnouncers();

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Meet Our Hosts" viewAllLink="/announcers" />
        <div className="mt-5 flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex w-[96px] shrink-0 flex-col items-center">
              <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-gray-100" />
              <div className="mx-auto mt-2 h-3 w-12 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!announcers?.length) return null;

  return (
    <section>
      <SectionHeader title="Meet Our Hosts" viewAllLink="/announcers" />
      <div className="mt-5">
        <Swiper spaceBetween={12} slidesPerView={4.2} slidesPerGroup={1} freeMode>
          {announcers.map((announcer) => {
            const image =
              announcer._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium_large?.source_url ??
              announcer._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

            return (
              <SwiperSlide key={announcer.id} className="!w-[96px]">
                <Link to={`/announcers/${announcer.slug}`} className="group flex flex-col items-center text-center">
                  <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full bg-white p-[2px] shadow-sm ring-1 ring-black/5 transition group-hover:shadow-md">
                    <div className="h-full w-full overflow-hidden rounded-full">
                      {image ? (
                        <img
                          src={image}
                          alt={announcer.title.rendered}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>
                    <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                  </div>
                  <p className="mt-2 line-clamp-1 w-[96px] text-xs font-semibold leading-tight text-gray-900 group-hover:text-[#bda752]">
                    {announcer.title.rendered}
                  </p>
                  <p className="line-clamp-1 w-[96px] text-[11px] text-gray-500">Host</p>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
