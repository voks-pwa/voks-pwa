import { BrowserRouter } from "react-router-dom";

import { RewardPopup } from "@/features/missions/components/RewardPopup";

import { AppRoutes } from "@/routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>

      <AppRoutes />

      <RewardPopup />

    </BrowserRouter>
  );
}

export default App;