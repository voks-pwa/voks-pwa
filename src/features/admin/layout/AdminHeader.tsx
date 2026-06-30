import { Bell } from "lucide-react";

import { useProfile } from "@/hooks/useProfile";

export function AdminHeader() {

  const { data: profile } = useProfile();

  return (

    <header
      className="
      h-20
      border-b
      bg-white
      px-8
      flex
      items-center
      justify-between
    "
    >

      <div>

        <h2 className="text-2xl font-black">
          Dashboard
        </h2>

        <p className="text-sm text-gray-500">
          Welcome back
        </p>

      </div>

      <div className="flex items-center gap-5">

        <button
          className="
            h-11
            w-11
            rounded-full
            bg-gray-100
            flex
            items-center
            justify-center
          "
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3">

          <img
            src={
              profile?.avatar_url ??
              "/default-avatar.png"
            }
            className="
              h-11
              w-11
              rounded-full
              object-cover
            "
          />

          <div>

            <p className="font-semibold">
              {profile?.display_name}
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>

          </div>

        </div>

      </div>

    </header>

  );
}