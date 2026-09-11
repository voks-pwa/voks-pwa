import { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from "@/components/ui/Toast";

import { AppRoutes } from "@/routes/AppRoutes";
import { useCampaignAutomation } from "@/features/campaigns/hooks/useCampaignAutomation";
import { useAuth } from "@/features/auth/useAuth";
import { NotificationProvider } from "@/features/notifications";

/*
  Agentation is a local-only visual feedback toolbar.
  - Rendered in DEV only, and never shipped in the production bundle:
    `import.meta.env.DEV` is statically replaced with `false`, so the
    dynamic import below is tree-shaken out of the build.
  - No `endpoint` is passed, so it runs purely on localStorage — no network
    calls, no console spam from a missing local agent server at :4747.
  - Disable locally with VITE_AGENTATION_ENABLED=false in .env.
*/
const Agentation = import.meta.env.DEV
  ? lazy(() => import("agentation").then((m) => ({ default: m.Agentation })))
  : null;

function AppInner() {
  useCampaignAutomation();
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.id ?? null}>

      <AppRoutes />

      <ToastContainer />

    </NotificationProvider>
  );
}

function App() {
  const agentationEnabled =
    import.meta.env.DEV && import.meta.env.VITE_AGENTATION_ENABLED !== "false";

  return (
    <BrowserRouter>
      <AppInner />
      {agentationEnabled && Agentation && (
        <Suspense fallback={null}>
          <Agentation />
        </Suspense>
      )}
    </BrowserRouter>
  );
}

export default App;
