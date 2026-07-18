import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useAnnouncers } from "@/hooks/useAnnouncers";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function HostsSlider() {
  const { data: announcers, isLoading } = useAnnouncers();

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Meet Our Hosts" viewAllLink="/announcers" />
        <div className="mt-5 flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0">
              <div className="h-20 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="mx-auto mt-2 h-3 w-16 animate-pulse rounded bg-gray-100" />
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
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={3.5}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
        >
          {announcers.map((announcer) => {
            const image =
              announcer._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium_large?.source_url ??
              announcer._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

            return (
              <SwiperSlide key={announcer.id}>
                <Link to={`/announcers/${announcer.slug}`} className="block text-center">
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-[#bda752]">
                    {image ? (
                      <img
                        src={image}
                        alt={announcer.title.rendered}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-gray-800">
                    {announcer.title.rendered}
                  </p>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
