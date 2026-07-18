import type { NavigateFunction } from "react-router-dom";

export interface DeepLinkConfig {
  open_mode?: string;
  deep_link?: {
    url?: string;
    target?: string;
  };
}

export function handleDeepLink(
  navigate: NavigateFunction,
  config: DeepLinkConfig
): void {
  const mode = config.open_mode;
  const url = config.deep_link?.url;
  const target = config.deep_link?.target;

  if (!url) {
    console.warn("Deep link url is empty", config);
    return;
  }

  switch (mode) {
    case "External URL":
      window.open(url, target || "_blank", "noopener,noreferrer");
      break;
    case "Internal Route":
      navigate(url);
      break;
    case "Mission":
      navigate(`/missions/${url}`);
      break;
    case "Reward":
      navigate("/reward-store");
      break;
    case "Podcast":
      navigate(`/plus/${url}`);
      break;
    default:
      navigate(url);
      break;
  }
}
