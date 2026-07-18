import { CheckCircle2, XCircle, PackageCheck } from "lucide-react";

import { useUpdateRewardRedemption } from "../hooks/useUpdateRewardRedemption";

interface Props {
  redemptionId: string;
  status: string;
}

export function RedemptionActionMenu({
  redemptionId,
  status,
}: Props) {
  const mutation =
    useUpdateRewardRedemption();

  function update(next: string) {
    mutation.mutate({
      redemptionId,
      status: next,
    });
  }

  return (
    <div className="flex gap-2">

      {status === "pending" && (
        <>
          <button
            onClick={() => update("approved")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <CheckCircle2 size={16} />
            Approve
          </button>

          <button
            onClick={() => update("rejected")}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <XCircle size={16} />
            Reject
          </button>
        </>
      )}

      {status === "approved" && (
        <button
          onClick={() => update("completed")}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          <PackageCheck size={16} />
          Complete
        </button>
      )}

    </div>
  );
}