interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="
          fixed
          inset-0
          z-[100]
          bg-black/40
          backdrop-blur-sm
        "
        onClick={onCancel}
      />

      <div
        className="
          fixed
          left-1/2
          top-1/2
          z-[101]
          w-[420px]
          max-w-[90vw]
          -translate-x-1/2
          -translate-y-1/2
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
        "
      >
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-3 text-gray-600">
          {description}
        </p>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onCancel}
            className="
              rounded-xl
              border
              px-5
              py-2
            "
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className={`
              rounded-xl
              px-5
              py-2
              text-white

              ${
                danger
                  ? "bg-red-600"
                  : "bg-[#bda752]"
              }
            `}
          >
            {confirmLabel}
          </button>

        </div>
      </div>
    </>
  );
}