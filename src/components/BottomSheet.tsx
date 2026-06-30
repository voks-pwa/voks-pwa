import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  children,
}: BottomSheetProps) {
  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`
          fixed inset-0
          z-40
          bg-black/40
          backdrop-blur-sm
          transition-all
          duration-300

          ${
            open
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }
        `}
      />

      {/* Sheet */}

      <div
        className={`
          fixed
          bottom-0
          left-0
          right-0
          z-50

          bg-white
          rounded-t-4xl
          shadow-2xl

          bottom-0
            h-[calc(100vh-80px)]

          flex
          flex-col

          transition-transform
          duration-300

          ${
            open
              ? "translate-y-0"
              : "translate-y-full"
          }
        `}
      >
        {/* Handle */}

        <div className="flex justify-center py-3 shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Scroll Area */}

        <div
          className="
            flex-1
            overflow-y-auto
            overscroll-contain
          "
        >
          {children}
        </div>
      </div>
    </>
  );
}