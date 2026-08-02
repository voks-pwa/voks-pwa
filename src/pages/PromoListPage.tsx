import { useNavigate } from "react-router-dom";
import { usePromos } from "@/hooks/usePromos";
import { useAuth } from "@/features/auth/useAuth";
import { track } from "@/core/action-engine";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { handleDeepLink } from "@/utils/deepLink";

export function PromoListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: promos, isLoading, isError, refetch } = usePromos();

  const handlePromoClick = (promo: NonNullable<typeof promos>[number]) => {
    if (user) {
      track("BANNER_CLICK", user.id, {
        promo_id: promo.id,
        promo_title: promo.title.rendered,
        position: "promo_list",
        timestamp: new Date().toISOString(),
      });
    }
    handleDeepLink(navigate, promo.acf ?? {});
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Promotions
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Special offers and promotions
      </p>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          message="Failed to load promotions"
          onRetry={refetch}
        />
      )}

      {promos && promos.length === 0 && (
        <EmptyState
          title="No promotions"
          message="Check back later for new offers"
        />
      )}

      {promos && promos.length > 0 && (
        <div className="space-y-4">
          {promos.map((promo) => {
            const media = (promo._embedded?.["wp:featuredmedia"] as Array<Record<string, unknown>> | undefined)?.[0];
            const sizes = (media?.media_details as Record<string, unknown> | undefined)?.sizes as Record<string, unknown> | undefined;
            const image = (sizes?.medium_large as Record<string, unknown> | undefined)?.source_url as string || (media?.source_url as string) || "";

            return (
              <button
                key={promo.id}
                type="button"
                onClick={() => handlePromoClick(promo)}
                className="block w-full text-left"
              >
                <div className="flex overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
                  {image && (
                    <img
                      src={image}
                      alt={promo.title.rendered}
                      className="h-28 w-28 shrink-0 object-cover sm:h-36 sm:w-36"
                      loading="lazy"
                    />
                  )}
                  <div className="flex flex-1 flex-col justify-center px-5 py-4">
                    {promo.acf?.promo_badge && (
                      <span className="mb-1 inline-block w-fit rounded-full bg-[#bda752] px-2 py-0.5 text-[10px] font-bold text-white">
                        {promo.acf.promo_badge}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                      {promo.title.rendered}
                    </h3>
                    {promo.excerpt?.rendered && (
                      <p
                        className="mt-1 text-xs text-gray-500 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: promo.excerpt.rendered }}
                      />
                    )}
                  </div>
                  <div className="flex items-center pr-4">
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
