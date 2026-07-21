import { type ReactNode } from "react";
import { useIsFeatureEnabled, type FeatureKey } from "@/features/flags";
import { ComingSoon } from "./ComingSoon";

interface Props {
  feature: FeatureKey;
  children: ReactNode;
  title?: string;
  description?: string;
}

export function FeatureGuard({ feature, children, title, description }: Props) {
  const enabled = useIsFeatureEnabled(feature);

  if (!enabled) {
    return <ComingSoon title={title ?? ""} description={description} />;
  }

  return <>{children}</>;
}
