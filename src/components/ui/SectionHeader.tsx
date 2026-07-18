import { ChevronRight } from "lucide-react";
import { Link, type LinkProps } from "react-router-dom";

interface SectionHeaderProps {
  title: string;
  label?: string;
  viewAllLink?: LinkProps["to"];
  viewAllText?: string;
}

export function SectionHeader({
  title,
  label,
  viewAllLink,
  viewAllText = "View All",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        {label && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[#bda752]">
            {label}
          </p>
        )}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 text-sm font-semibold text-[#bda752] transition-colors hover:text-[#a8913f]"
        >
          {viewAllText}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
