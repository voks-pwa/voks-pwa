import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Outlet />
    </main>
  );
}