import {
  LayoutDashboard,
  Users,
  Gift,
  Coins,
  Flag,
  BarChart3,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/admin",
  },
  {
    label: "Users",
    icon: Users,
    to: "/admin/users",
  },
  {
    label: "Reward Redemptions",
    icon: Gift,
    to: "/admin/reward-redemptions",
  },
  {
    label: "Transactions",
    icon: Coins,
    to: "/admin/transactions",
  },
  {
    label: "Missions",
    icon: Flag,
    to: "/admin/missions",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    to: "/admin/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    to: "/admin/settings",
  },
];

export function AdminSidebar() {
  return (
    <aside className="w-72 bg-[#4E523C] text-white flex flex-col">

      <div className="px-8 py-8">

        <h1 className="text-3xl font-black">
          VOKS
        </h1>

        <p className="text-sm text-white/70">
          Admin Dashboard
        </p>

      </div>

      <nav className="flex-1 px-4">

        {menus.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `
                mb-2
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                transition

                ${
                  isActive
                    ? "bg-[#C1A85A] text-white"
                    : "text-white/80 hover:bg-white/10"
                }
                `
              }
            >
              <Icon size={20} />

              <span className="font-medium">
                {item.label}
              </span>

            </NavLink>

          );
        })}
      </nav>

    </aside>
  );
}