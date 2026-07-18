import {
  Pencil,
  Power,
} from "lucide-react";

interface Props {
  missionId: number;
  active: boolean;
  onEdit: (missionId: number) => void;
}

export function MissionActionMenu({
  missionId,
  active,
  onEdit,
}: Props) {
  return (
    <div className="flex justify-end gap-2">

      <button
        onClick={() => onEdit(missionId)}
        className="
          rounded-xl
          border
          border-gray-200
          p-2
          hover:bg-gray-100
        "
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={() =>
          console.log(
            "Toggle mission",
            missionId
          )
        }
        className={`
          rounded-xl
          p-2
          ${
            active
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-red-600 text-white hover:bg-red-700"
          }
        `}
      >
        <Power size={16} />
      </button>

    </div>
  );
}