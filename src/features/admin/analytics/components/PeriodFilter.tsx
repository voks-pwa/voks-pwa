interface PeriodOption {
  label: string;
  value: number;
}

interface PeriodFilterProps {
  options: PeriodOption[];
  selected: number;
  onChange: (value: number) => void;
}

export function PeriodFilter({ options, selected, onChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            selected === opt.value
              ? "bg-[#bda752] text-white"
              : "bg-white text-gray-600 shadow-sm"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
