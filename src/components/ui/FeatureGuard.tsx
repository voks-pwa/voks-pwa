import { type ReactNode } from "react";
import { isFeatureEnabled, type FeatureKey } from "@/features/flags";
import { ComingSoon } from "./ComingSoon";

interface Props {
  feature: FeatureKey;
  children: ReactNode;
  title?: string;
  description?: string;
}

export function FeatureGuard({ feature, children, title, description }: Props) {
  if (!isFeatureEnabled(feature)) {
    return <ComingSoon title={title ?? ""} description={description} />;
  }

  return <>{children}</>;
}
