import { useState } from "react";
import { Save, AlertCircle, Coins, ListTree, Percent } from "lucide-react";
import { showToast } from "@/components/ui/showToast";
import { useAdminEconomy } from "../hooks/useAdminEconomy";
import type { XpRule, XpMultiplier } from "@/features/economy/types";

type Tab = "caps" | "rules" | "multipliers";

function CapsTab({ config, onSave, isSaving }: {
  config: ReturnType<typeof useAdminEconomy>["config"];
  onSave: (vals: Record<string, number>) => Promise<void>;
  isSaving: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    VXP_EARNING_DAILY_CAP: config?.VXP_EARNING_DAILY_CAP ?? 200,
    VXP_SPENDING_DAILY_CAP: config?.VXP_SPENDING_DAILY_CAP ?? 500,
    VXP_SPENDING_WEEKLY_CAP: config?.VXP_SPENDING_WEEKLY_CAP ?? 2000,
    VXP_SPENDING_MONTHLY_CAP: config?.VXP_SPENDING_MONTHLY_CAP ?? 8000,
    VXP_MIN_BALANCE_FOR_REDEMPTION: config?.VXP_MIN_BALANCE_FOR_REDEMPTION ?? 100,
  });

  const fields = [
    { key: "VXP_EARNING_DAILY_CAP", label: "Daily Earning Cap" },
    { key: "VXP_SPENDING_DAILY_CAP", label: "Daily Spending Cap" },
    { key: "VXP_SPENDING_WEEKLY_CAP", label: "Weekly Spending Cap" },
    { key: "VXP_SPENDING_MONTHLY_CAP", label: "Monthly Spending Cap" },
    { key: "VXP_MIN_BALANCE_FOR_REDEMPTION", label: "Min Balance for Redemption" },
  ];

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.key as keyof typeof values];
      if (v < 0) errs[f.key] = `${f.label} must be positive`;
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSave(values);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <Coins className="text-[#bda752]" size={24} />
        <h2 className="text-xl font-black">Wallet Caps</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-sm font-semibold text-gray-600">{field.label}</label>
            <input
              type="number"
              value={values[field.key as keyof typeof values]}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: Number(e.target.value) }))}
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752] ${errors[field.key] ? "border-red-400" : ""}`}
            />
            {errors[field.key] && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors[field.key]}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 flex items-center gap-2 rounded-xl bg-[#bda752] px-6 py-3 font-bold text-white transition hover:bg-[#a8933e] disabled:opacity-50"
      >
        <Save size={18} />
        {isSaving ? "Saving..." : "Save Wallet Caps"}
      </button>
    </section>
  );
}

function RulesTab({ rules, onUpdate, isUpdating }: {
  rules: XpRule[];
  onUpdate: (args: { slug: string; updates: Partial<Pick<XpRule, "base_xp" | "enabled">> }) => Promise<void>;
  isUpdating: boolean;
}) {
  const [editing, setEditing] = useState<Record<string, { base_xp: number; enabled: boolean }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const getLocal = (rule: XpRule) =>
    editing[rule.slug] ?? { base_xp: rule.base_xp, enabled: rule.enabled };

  const sourceGroups = rules.reduce(
    (acc, r) => {
      const group = r.source || "other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(r);
      return acc;
    },
    {} as Record<string, XpRule[]>,
  );

  const handleSave = async (slug: string) => {
    setSaving(slug);
    try {
      await onUpdate({ slug, updates: getLocal(rules.find((r) => r.slug === slug)!) });
      showToast({ type: "success", title: "Rule updated" });
    } catch {
      showToast({ type: "error", title: "Failed to update rule" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <ListTree className="text-[#bda752]" size={24} />
        <h2 className="text-xl font-black">XP Rules</h2>
      </div>

      {Object.entries(sourceGroups).map(([source, groupRules]) => (
        <div key={source} className="mb-8">
          <h3 className="mb-3 text-lg font-bold capitalize text-gray-700">{source}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-400">
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Base XP</th>
                  <th className="px-3 py-2">Enabled</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {groupRules.map((rule) => {
                  const local = getLocal(rule);
                  return (
                    <tr key={rule.slug} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">{rule.slug}</td>
                      <td className="px-3 py-2">{rule.title}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={local.base_xp}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [rule.slug]: { ...local, base_xp: Number(e.target.value) },
                            }))
                          }
                          className="w-20 rounded-lg border bg-gray-50 px-2 py-1 text-center outline-none focus:border-[#bda752]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() =>
                            setEditing((prev) => ({
                              ...prev,
                              [rule.slug]: { ...local, enabled: !local.enabled },
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            local.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {local.enabled ? "ON" : "OFF"}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleSave(rule.slug)}
                          disabled={isUpdating && saving === rule.slug}
                          className="rounded-lg bg-[#bda752] px-3 py-1 text-xs font-bold text-white hover:bg-[#a8933e] disabled:opacity-50"
                        >
                          {saving === rule.slug ? "..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

function MultipliersTab({ multipliers, onUpdate, isUpdating }: {
  multipliers: XpMultiplier[];
  onUpdate: (args: { slug: string; updates: Partial<Pick<XpMultiplier, "multiplier" | "enabled">> }) => Promise<void>;
  isUpdating: boolean;
}) {
  const [editing, setEditing] = useState<Record<string, { multiplier: number; enabled: boolean }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const getLocal = (m: XpMultiplier) =>
    editing[m.slug] ?? { multiplier: m.multiplier, enabled: m.enabled };

  const handleSave = async (slug: string) => {
    setSaving(slug);
    try {
      await onUpdate({ slug, updates: getLocal(multipliers.find((m) => m.slug === slug)!) });
      showToast({ type: "success", title: "Multiplier updated" });
    } catch {
      showToast({ type: "error", title: "Failed to update multiplier" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <Percent className="text-[#bda752]" size={24} />
        <h2 className="text-xl font-black">Multipliers</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-gray-400">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Multiplier</th>
              <th className="px-3 py-2">Enabled</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {multipliers.map((m) => {
              const local = getLocal(m);
              return (
                <tr key={m.slug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold">{m.title}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{m.type}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.1"
                      value={local.multiplier}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [m.slug]: { ...local, multiplier: Number(e.target.value) },
                        }))
                      }
                      className="w-20 rounded-lg border bg-gray-50 px-2 py-1 text-center outline-none focus:border-[#bda752]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() =>
                        setEditing((prev) => ({
                          ...prev,
                          [m.slug]: { ...local, enabled: !local.enabled },
                        }))
                      }
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        local.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {local.enabled ? "ON" : "OFF"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleSave(m.slug)}
                      disabled={isUpdating && saving === m.slug}
                      className="rounded-lg bg-[#bda752] px-3 py-1 text-xs font-bold text-white hover:bg-[#a8933e] disabled:opacity-50"
                    >
                      {saving === m.slug ? "..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function EconomyPage() {
  const {
    config, isLoading, error, updateConfig, isUpdating,
    rules, isLoadingRules, updateRule, isUpdatingRule,
    multipliers, isLoadingMultipliers, updateMultiplier, isUpdatingMultiplier,
  } = useAdminEconomy();

  const [tab, setTab] = useState<Tab>("caps");

  const tabs: { key: Tab; label: string; icon: typeof Coins }[] = [
    { key: "caps", label: "Wallet Caps", icon: Coins },
    { key: "rules", label: "XP Rules", icon: ListTree },
    { key: "multipliers", label: "Multipliers", icon: Percent },
  ];

  if (isLoading) {
    return <div className="flex h-52 items-center justify-center">Loading economy config...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Failed to load economy configuration.</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-black">Economy Configuration</h1>
        <p className="text-gray-500">Manage wallet caps, XP rules, and multipliers</p>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
                tab === t.key
                  ? "border-[#bda752] text-[#bda752]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "caps" && (
        <CapsTab config={config} onSave={updateConfig} isSaving={isUpdating} />
      )}

      {tab === "rules" && (
        isLoadingRules
          ? <div className="p-4 text-gray-500">Loading rules...</div>
          : <RulesTab rules={rules} onUpdate={updateRule} isUpdating={isUpdatingRule} />
      )}

      {tab === "multipliers" && (
        isLoadingMultipliers
          ? <div className="p-4 text-gray-500">Loading multipliers...</div>
          : <MultipliersTab multipliers={multipliers} onUpdate={updateMultiplier} isUpdating={isUpdatingMultiplier} />
      )}
    </div>
  );
}
