import type { Profile } from "@/features/profile";

interface Props {
  user: Profile;
}

export function UserStatsCard({ user }: Props) {
  return (
    <div
      className="
      mt-6
      grid
      grid-cols-3
      gap-4
      "
    >
      <Card
        title="Lifetime VXP"
        value={user.lifetime_vxp ?? 0}
      />

      <Card
        title="Current VXP"
        value={user.current_vxp ?? 0}
      />

      <Card
        title="Level"
        value={user.level ?? 1}
      />
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      className="
      rounded-2xl
      bg-[#F8F8F8]
      p-5
      "
    >
      <p className="text-xs text-gray-500">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black">
        {value.toLocaleString()}
      </h3>
    </div>
  );
}