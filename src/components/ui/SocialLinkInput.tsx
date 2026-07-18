interface SocialLinkInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
}

export function SocialLinkInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
}: SocialLinkInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-[#bda752]">
        {prefix && (
          <span className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
            {prefix}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
        />
      </div>
    </div>
  );
}
