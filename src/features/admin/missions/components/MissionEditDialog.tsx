import { useState } from "react";
import { Loader2 } from "lucide-react";

interface MissionEditData {
  id: number;
  title: string;
  description: string;
  reward: number;
  target: number;
  active: boolean;
}

interface Props {
  open: boolean;
  mission: MissionEditData | null;
  saving: boolean;
  onSave: (data: MissionEditData) => void;
  onClose: () => void;
}

function initMission(mission: MissionEditData | null) {
  return {
    title: mission?.title ?? "",
    description: mission?.description ?? "",
    reward: mission ? String(mission.reward) : "",
    target: mission ? String(mission.target) : "",
    active: mission?.active ?? false,
  };
}

export function MissionEditDialog({
  open,
  mission,
  saving,
  onSave,
  onClose,
}: Props) {
  const [form, setForm] = useState(() => initMission(mission));
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  function setField<K extends keyof ReturnType<typeof initMission>>(key: K, value: ReturnType<typeof initMission>[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!form.title.trim()) {
      next.title = "Title is required";
    }

    if (!form.reward || isNaN(Number(form.reward))) {
      next.reward = "Reward must be a number";
    }

    if (!form.target || isNaN(Number(form.target))) {
      next.target = "Target must be a number";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!validate() || !mission) return;

    onSave({
      id: mission.id,
      title: form.title.trim(),
      description: form.description.trim(),
      reward: Number(form.reward),
      target: Number(form.target),
      active: form.active,
    });
  }

  if (!open || !mission) return null;

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
        onClick={onClose}
      />

      <div
        className="
          fixed
          left-1/2
          top-1/2
          z-[101]
          w-[480px]
          max-w-[90vw]
          -translate-x-1/2
          -translate-y-1/2
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
        "
        key={mission.id}
      >
        <h2 className="text-xl font-bold">
          Edit Mission
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Title
            </label>

            <input
              value={form.title}
              onChange={(e) =>
                setField("title", e.target.value)
              }
              className={`
                w-full
                rounded-xl
                border
                px-4
                py-2
                outline-none
                transition-colors
                focus:ring-2
                focus:ring-[#bda752]
                ${
                  errors.title
                    ? "border-red-400"
                    : "border-gray-200"
                }
              `}
            />

            {errors.title && (
              <p className="mt-1 text-xs text-red-500">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setField("description", e.target.value)
              }
              rows={3}
              className="
                w-full
                rounded-xl
                border
                border-gray-200
                px-4
                py-2
                outline-none
                transition-colors
                focus:ring-2
                focus:ring-[#bda752]
              "
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Reward (VXP)
              </label>

              <input
                value={form.reward}
                onChange={(e) =>
                  setField("reward", e.target.value)
                }
                type="number"
                className={`
                  w-full
                  rounded-xl
                  border
                  px-4
                  py-2
                  outline-none
                  transition-colors
                  focus:ring-2
                  focus:ring-[#bda752]
                  ${
                    errors.reward
                      ? "border-red-400"
                      : "border-gray-200"
                  }
                `}
              />

              {errors.reward && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.reward}
                </p>
              )}
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Target
              </label>

              <input
                value={form.target}
                onChange={(e) =>
                  setField("target", e.target.value)
                }
                type="number"
                className={`
                  w-full
                  rounded-xl
                  border
                  px-4
                  py-2
                  outline-none
                  transition-colors
                  focus:ring-2
                  focus:ring-[#bda752]
                  ${
                    errors.target
                      ? "border-red-400"
                      : "border-gray-200"
                  }
                `}
              />

              {errors.target && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.target}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Active
            </label>

            <button
              type="button"
              onClick={() =>
                setField("active", !form.active)
              }
              className={`
                h-6
                w-11
                rounded-full
                transition-colors
                ${
                  form.active
                    ? "bg-green-500"
                    : "bg-gray-300"
                }
              `}
            >
              <span
                className={`
                  block
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  shadow
                  transition-transform
                  ${
                    form.active
                      ? "translate-x-[22px]"
                      : "translate-x-[2px]"
                  }
                `}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                rounded-xl
                border
                border-gray-200
                px-5
                py-2
                transition-colors
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-[#bda752]
                px-5
                py-2
                text-white
                transition-colors
                hover:bg-[#a8913f]
                disabled:opacity-50
              "
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}
              {saving
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
