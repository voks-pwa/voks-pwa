import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { useUpdateRewardRedemption } from "../hooks/useUpdateRewardRedemption";
// ========================================================
// TAMBAHAN IMPORT: Komponen dialog konfirmasi global
// ========================================================
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Props {
  id: string;
}

type StatusType = "approved" | "completed" | "rejected";

export function RedemptionActionMenu({ id }: Props) {
  const [open, setOpen] = useState(false);
  
  // ========================================================
  // TAMBAHAN STATE: Untuk mengontrol Modal Konfirmasi
  // ========================================================
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusType>("approved");

  const mutation = useUpdateRewardRedemption();

  // Fungsi pembantu untuk membuka dialog konfirmasi dan menutup dropdown menu menu
  const handleSelectStatus = (status: StatusType) => {
    setSelectedStatus(status);
    setConfirmOpen(true);
    setOpen(false); // Menutup dropdown menu MoreVertical secara otomatis
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
        aria-label="Aksi Menu"
      >
        <MoreVertical size={18} />
      </button>

      {/* DROPDOWN OPTIONS MENU */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-gray-100 bg-white shadow-xl py-1 overflow-hidden">
          <button
            onClick={() => handleSelectStatus("approved")}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Approve
          </button>

          <button
            onClick={() => handleSelectStatus("completed")}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Complete
          </button>

          <button
            onClick={() => handleSelectStatus("rejected")}
            className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {/* ========================================================
        TAMBAHAN: GLOBAL CONFIRMATION DIALOG INTERACTIVE LAYER
      ======================================================== */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Action"
        description={`Change redemption status to "${selectedStatus}" ?`}
        confirmLabel="Continue"
        danger={selectedStatus === "rejected"}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          mutation.mutate({
            id,
            status: selectedStatus,
          });
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}