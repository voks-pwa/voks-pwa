interface Props {
  status: string;
}

function getColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-orange-100 text-orange-700";

    case "approved":
      return "bg-blue-100 text-blue-700";

    case "completed":
      return "bg-green-100 text-green-700";

    case "rejected":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function RedemptionStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${getColor(status)}
      `}
    >
      {status}
    </span>
  );
}