import { Outlet } from "react-router-dom";

import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#F5F5F5]">

      <AdminSidebar />

      <div className="flex flex-1 flex-col">

        <AdminHeader />

        <main
          className="
            flex-1
            overflow-auto
            p-8
          "
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}