import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from "@/components/ui/Toast";

import { AppRoutes } from "@/routes/AppRoutes";
import { useCampaignAutomation } from "@/features/campaigns/hooks/useCampaignAutomation";
import { useAuth } from "@/features/auth/useAuth";
import { NotificationProvider } from "@/features/notifications";

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
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;