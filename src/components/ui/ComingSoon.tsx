import { Clock } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
        <Clock size={32} />
      </div>
      <h2 className="mt-4 text-xl font-black text-gray-800">{title}</h2>
      <p className="mt-2 max-w-xs text-sm text-gray-400">
        {description ?? "We're working hard to bring this feature to you. Stay tuned!"}
      </p>
    </div>
  );
}
