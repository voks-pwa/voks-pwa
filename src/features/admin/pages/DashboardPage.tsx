import {
  Users,
  Gift,
  Coins,
  Trophy,
  ArrowUpRight,
} from "lucide-react";

export function DashboardPage() {
  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-black">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Welcome to VOKS NEXT Admin Panel
        </p>

      </div>

      {/* Cards */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <DashboardCard
          title="Users"
          value="1,248"
          icon={<Users size={26} />}
          color="bg-blue-500"
        />

        <DashboardCard
          title="Reward Redemptions"
          value="37"
          icon={<Gift size={26} />}
          color="bg-amber-500"
        />

        <DashboardCard
          title="VXP Transactions"
          value="5,913"
          icon={<Coins size={26} />}
          color="bg-green-500"
        />

        <DashboardCard
          title="Completed Missions"
          value="12,842"
          icon={<Trophy size={26} />}
          color="bg-purple-500"
        />

      </div>

      {/* Recent Activity */}

      <div className="rounded-3xl bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold">
              Recent Activity
            </h2>

            <p className="text-sm text-gray-500">
              Latest reward redemptions
            </p>

          </div>

        </div>

        <div className="space-y-4">

          {[1, 2, 3, 4].map((i) => (

            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border p-4"
            >

              <div>

                <p className="font-semibold">
                  User redeemed Spotify Premium
                </p>

                <p className="text-sm text-gray-500">
                  5 minutes ago
                </p>

              </div>

              <ArrowUpRight
                size={18}
                className="text-gray-400"
              />

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function DashboardCard({
  title,
  value,
  icon,
  color,
}: CardProps) {
  return (
    <div
      className="
        rounded-3xl
        bg-white
        p-6
        shadow-sm
      "
    >

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {value}
          </h2>

        </div>

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            text-white
            ${color}
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}