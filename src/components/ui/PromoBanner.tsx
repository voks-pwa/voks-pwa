import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleDeepLink } from "@/utils/deepLink";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { usePromos } from "@/hooks/usePromos";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./ErrorState";
import { ChevronRight } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";

function getPromoImage(promo: { _embedded?: Record<string, unknown> }) {
  const media = (promo._embedded?.["wp:featuredmedia"] as Array<Record<string, unknown>> | undefined)?.[0];
  const sizes = (media?.media_details as Record<string, unknown> | undefined)?.sizes as Record<string, unknown> | undefined;
  return (sizes?.medium_large as Record<string, unknown> | undefined)?.source_url as string
    || (media?.source_url as string)
    || "";
}

export const PromoBanner = memo(function PromoBanner() {
  const navigate = useNavigate();

  const { data: promos, isLoading, isError, refetch } = usePromos();

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-3xl" />;
  }

  if (isError) {
    return <ErrorState message="Failed to load promotions" onRetry={refetch} />;
  }

  if (!promos?.length) {
    return null;
  }

  const sorted = [...promos].sort((a, b) => {
    if (a.acf?.promo_featured && !b.acf?.promo_featured) return -1;
    if (!a.acf?.promo_featured && b.acf?.promo_featured) return 1;
    return 0;
  });

  function handleSlideClick(promo: typeof sorted[number]) {
    handleDeepLink(navigate, promo.acf ?? {});
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={sorted.length > 1}
        className="overflow-visible"
      >
        {sorted.map((promo) => {
          const image = getPromoImage(promo);

          return (
            <SwiperSlide key={promo.id}>
              <button
                onClick={() => handleSlideClick(promo)}
                className="relative block h-48 w-full overflow-hidden rounded-3xl sm:h-52 focus-visible:outline-2 focus-visible:outline-[#bda752]"
              >
                {image ? (
                  <OptimizedImage
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#5d5b3d] to-[#bda752]" />
                )}
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="mt-3 flex items-center justify-between">
        <div className="swiper-pagination !static !w-auto" />
        <Link
          to="/promo"
          className="flex items-center gap-1 text-sm font-semibold text-[#bda752]"
        >
          View All
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
})
