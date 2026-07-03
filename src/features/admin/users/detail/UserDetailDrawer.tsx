import { X } from "lucide-react";

import { useProfile } from "@/features/profile";

import { UserLoading } from "./UserLoading";
import { UserDetailHeader } from "./UserDetailHeader";
import { UserProfileCard } from "./UserProfileCard";
import { UserStatsCard } from "./UserStatsCard";

interface Props {

  open: boolean;

  userId?: string;

  onClose: () => void;

}

export function UserDetailDrawer({

  open,

  userId,

  onClose,

}: Props) {

  const {

    data: selectedUser,

    isLoading,

  } = useProfile(userId);

  if (!open) {

    return null;

  }

  return (

    <div
      className="
      fixed
      inset-0
      z-50
      flex
      justify-end
      bg-black/40
      backdrop-blur-sm
      "
    >

      <div
        className="
        h-full
        w-full
        max-w-140
        overflow-y-auto
        bg-[#F5F5F5]
        p-8
        shadow-2xl
        "
      >

        <div
          className="
          mb-8
          flex
          items-center
          justify-between
          "
        >

          <h2 className="text-xl font-black">

            User Detail

          </h2>

          <button

            onClick={onClose}

            className="
            rounded-xl
            p-2
            hover:bg-gray-200
            "

          >

            <X size={22} />

          </button>

        </div>

        {isLoading && <UserLoading />}

        {!isLoading && selectedUser && (

          <div className="space-y-6">

            <UserDetailHeader user={selectedUser} />

            <UserProfileCard user={selectedUser} />

            <UserStatsCard user={selectedUser} />

          </div>

        )}

        {!isLoading && !selectedUser && (

          <div className="py-20 text-center text-gray-500">

            User tidak ditemukan.

          </div>

        )}

      </div>

    </div>

  );

}