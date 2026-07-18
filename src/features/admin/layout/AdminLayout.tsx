import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Star,
  Target,
  Gift,
  ShoppingBag,
  BarChart3,
  BarChart4,
  Megaphone,
  Settings,
  Flag,
} from "lucide-react";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    to: "/admin",
  },
  {
    title: "Campaigns",
    icon: Flag,
    to: "/admin/campaigns",
  },
  {
    title: "Users",
    icon: Users,
    to: "/admin/users",
  },
  {
    title: "Transactions",
    icon: Star,
    to: "/admin/transactions",
  },
  {
    title: "Missions",
    icon: Target,
    to: "/admin/missions",
  },
  {
    title: "Reward Catalog",
    icon: ShoppingBag,
    to: "/admin/reward-catalog",
  },
  {
    title: "Reward Redemptions",
    icon: Gift,
    to: "/admin/rewards",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    to: "/admin/analytics",
  },
  {
    title: "Reward Analytics",
    icon: BarChart4,
    to: "/admin/reward-analytics",
  },
  {
    title: "Broadcast",
    icon: Megaphone,
    to: "/admin/broadcast",
  },
  {
    title: "Settings",
    icon: Settings,
    to: "/admin/settings",
  },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">

      <div className="flex">

        {/* Sidebar */}

        <aside className="hidden w-72 shrink-0 bg-[#32362B] text-white xl:block">

          <div className="border-b border-white/10 p-8">

            <h1 className="text-3xl font-black">

              VOKS

            </h1>

            <p className="mt-1 text-sm text-white/60">

              Admin Panel

            </p>

          </div>

          <nav className="space-y-2 p-4">

            {menus.map((menu) => {

              const Icon = menu.icon;

              return (

                <NavLink
                  key={menu.to}
                  to={menu.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-2xl px-5 py-4 transition ${
                      isActive
                        ? "bg-[#bda752] text-white shadow-lg"
                        : "hover:bg-white/10"
                    }`
                  }
                >
                  <Icon size={20} />

                  <span className="font-semibold">

                    {menu.title}

                  </span>

                </NavLink>

              );
            })}

          </nav>

        </aside>

        {/* Main */}

        <main className="flex-1">

          <Outlet />

        </main>

      </div>

    </div>
  );
}