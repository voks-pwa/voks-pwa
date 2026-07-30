import { useState } from "react";
import { Loader2 } from "lucide-react";

export interface RewardEditData {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  cost: number;
  stock: number;
  active: boolean;
  featured: boolean;
  priority: number;
  status: string;
}

interface Props {
  open: boolean;
  reward: RewardEditData | null;
  saving: boolean;
  onSave: (data: RewardEditData) => void;
  onClose: () => void;
}

interface FormState {
  cost: string;
  stock: string;
  active: boolean;
  featured: boolean;
  priority: string;
  status: string;
}

function initReward(reward: RewardEditData | null): FormState {
  return {
    cost: reward ? String(reward.cost) : "",
    stock: reward ? String(reward.stock) : "",
    active: reward?.active ?? false,
    featured: reward?.featured ?? false,
    priority: reward ? String(reward.priority) : "0",
    status: reward?.status ?? "Available",
  };
}

export function RewardEditDialog({
  open,
  reward,
  saving,
  onSave,
  onClose,
}: Props) {
  const [form, setForm] = useState(() => initReward(reward));
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  function setField(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!form.cost || isNaN(Number(form.cost))) {
      next.cost = "Cost must be a number";
    }

    if (!form.stock || isNaN(Number(form.stock))) {
      next.stock = "Stock must be a number";
    }

    if (!form.priority || isNaN(Number(form.priority))) {
      next.priority = "Priority must be a number";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!validate() || !reward) return;

    onSave({
      id: reward.id,
      name: reward.name,
      subtitle: reward.subtitle,
      description: reward.description,
      cost: Number(form.cost),
      stock: Number(form.stock),
      active: form.active,
      featured: form.featured,
      priority: Number(form.priority),
      status: form.status,
    });
  }

  if (!open || !reward) return null;

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
        key={reward.id}
      >
        <h2 className="text-xl font-bold">
          Edit Reward
        </h2>
        {reward?.name && (
          <p className="mt-1 text-sm text-gray-400 truncate pr-4">
            {reward.name}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Cost (VXP)
              </label>

              <input
                value={form.cost}
                onChange={(e) =>
                  setField("cost", e.target.value)
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
                    errors.cost
                      ? "border-red-400"
                      : "border-gray-200"
                  }
                `}
              />

              {errors.cost && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.cost}
                </p>
              )}
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Stock
              </label>

              <input
                value={form.stock}
                onChange={(e) =>
                  setField("stock", e.target.value)
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
                    errors.stock
                      ? "border-red-400"
                      : "border-gray-200"
                  }
                `}
              />

              {errors.stock && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.stock}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Priority
              </label>

              <input
                value={form.priority}
                onChange={(e) =>
                  setField("priority", e.target.value)
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
                    errors.priority
                      ? "border-red-400"
                      : "border-gray-200"
                  }
                `}
              />

              {errors.priority && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.priority}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Status
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                setField("status", e.target.value)
              }
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
            >
              <option value="Available">
                Available
              </option>

              <option value="Limited">
                Limited
              </option>

              <option value="Expired">
                Expired
              </option>
            </select>
          </div>

          <div className="flex gap-6">
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

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">
                Featured
              </label>

              <button
                type="button"
                onClick={() =>
                  setField("featured", !form.featured)
                }
                className={`
                  h-6
                  w-11
                  rounded-full
                  transition-colors
                  ${
                    form.featured
                      ? "bg-blue-500"
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
                      form.featured
                        ? "translate-x-[22px]"
                        : "translate-x-[2px]"
                    }
                  `}
                />
              </button>
            </div>
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
