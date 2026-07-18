import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

interface AnalyticsLineChartProps {
  data: Record<string, unknown>[];
  title: string;
  lines: {
    dataKey: string;
    color: string;
    name: string;
  }[];
}

export function AnalyticsLineChart({ data, title, lines }: AnalyticsLineChartProps) {
  if (!data.length) return null;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-black">{title}</h2>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            {lines.map((l) => (
              <linearGradient key={l.dataKey} id={`gradient-${l.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={l.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={l.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          {lines.map((l) => (
            <Area
              key={l.dataKey}
              type="monotone"
              dataKey={l.dataKey}
              stroke={l.color}
              fill={`url(#gradient-${l.dataKey})`}
              strokeWidth={2}
              name={l.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
