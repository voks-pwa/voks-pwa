import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { usePromo } from "@/hooks/usePromo";
import { handleDeepLink } from "@/utils/deepLink";

export function PromoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: promo, isLoading, isError } = usePromo(slug);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#bda752]" />
      </div>
    );
  }

  if (isError || !promo) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <p className="text-lg font-semibold text-gray-700">Promo not found</p>
        <Link
          to="/"
          className="rounded-xl bg-[#bda752] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const media = (promo._embedded?.["wp:featuredmedia"] as Array<Record<string, unknown>> | undefined)?.[0];
  const sizes = (media?.media_details as Record<string, unknown> | undefined)?.sizes as Record<string, unknown> | undefined;
  const image = (sizes?.full as Record<string, unknown> | undefined)?.source_url as string
    || (sizes?.medium_large as Record<string, unknown> | undefined)?.source_url as string
    || (media?.source_url as string)
    || "";

  const isExternal = promo.acf?.open_mode === "External URL";
  const hasDeepLink = Boolean(promo.acf?.deep_link?.url);

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {image && (
        <img
          src={image}
          alt={promo.title.rendered}
          className="h-56 w-full rounded-3xl object-cover sm:h-72"
          loading="lazy"
        />
      )}

      <div className="mt-6 space-y-4">
        {promo.acf?.promo_badge && (
          <span className="inline-block rounded-full bg-[#bda752] px-3 py-1 text-xs font-bold text-white">
            {promo.acf.promo_badge}
          </span>
        )}

        <h1 className="text-2xl font-bold text-gray-900">
          {promo.title.rendered}
        </h1>

        {promo.content?.rendered && (
          <div
            className="prose prose-sm max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: promo.content.rendered }}
          />
        )}

        {promo.acf?.promo_terms && (
          <div className="rounded-2xl bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-bold text-gray-700">
              Terms & Conditions
            </h3>
            <p className="whitespace-pre-line text-sm text-gray-500">
              {promo.acf.promo_terms}
            </p>
          </div>
        )}

        {hasDeepLink && (
          <button
            type="button"
            onClick={() => handleDeepLink(navigate, promo.acf ?? {})}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bda752] py-3.5 text-base font-bold text-white transition-colors hover:bg-[#a8913f]"
          >
            {promo.acf?.promo_button_text || (isExternal ? "Visit Website" : "View Details")}
            {isExternal && <ExternalLink size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
