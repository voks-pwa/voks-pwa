import {
  Home,
  Radio,
  Podcast,
  Ellipsis,
  User,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export function BottomNavigation() {
  const items = [
    {
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      label: "Live",
      icon: Radio,
      path: "/live",
    },
    {
      label: "Voks+",
      icon: Podcast,
      path: "/plus",
    },
    {
      label: "More",
      icon: Ellipsis,
      path: "/more",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-lg justify-around py-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs font-medium ${
                  isActive ? "text-[#5B5B3F]" : "text-gray-400"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}