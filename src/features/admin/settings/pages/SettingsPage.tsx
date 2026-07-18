import { useRef, useState } from "react";
import { Save, User, Settings2, Globe, ExternalLink, AlertCircle } from "lucide-react";

import { showToast } from "@/components/ui/showToast";
import { useSettings } from "../hooks/useSettings";

import type { PlatformSettings } from "../types/settings";

interface ValidationError {
  field: string;
  message: string;
}

export function SettingsPage() {
  const {
    profile,
    settings,
    isLoading,
    error,
    updateProfile,
    isUpdatingProfile,
    updateSettings,
    isUpdatingSettings,
  } = useSettings();

  const displayNameRef = useRef<HTMLInputElement>(null);
  const avatarUrlRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  if (isLoading) {
    return <div className="flex h-52 items-center justify-center">Loading settings...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Failed to load settings.</div>;
  }

  const validateProfile = (): ValidationError[] => {
    const errs: ValidationError[] = [];
    const name = displayNameRef.current?.value ?? "";
    const avatar = avatarUrlRef.current?.value ?? "";
    if (!name.trim()) {
      errs.push({ field: "displayName", message: "Display name is required" });
    }
    if (avatar && !/^https?:\/\/.+/.test(avatar)) {
      errs.push({ field: "avatarUrl", message: "Avatar URL must be a valid URL" });
    }
    return errs;
  };

  const handleSaveProfile = async () => {
    const errs = validateProfile();
    setErrors(errs);
    if (errs.length > 0) return;

    try {
      const name = displayNameRef.current?.value ?? "";
      const avatar = avatarUrlRef.current?.value ?? "";
      await updateProfile({ display_name: name, avatar_url: avatar || null });
      showToast({ type: "success", title: "Profile saved" });
    } catch (e) {
      showToast({ type: "error", title: "Failed to save profile", message: e instanceof Error ? e.message : String(e) });
    }
  };

  const handleSaveSettings = async () => {
    const errs: ValidationError[] = [];
    const numberKeys = [
      "XP_PER_MISSION", "MISSION_COOLDOWN_MINUTES", "MAX_DAILY_MISSIONS",
      "MIN_XP_FOR_REDEMPTION", "LISTEN_XP_PER_MINUTE", "LISTEN_XP_DAILY_CAP",
    ];
    for (const key of numberKeys) {
      const input = document.querySelector<HTMLInputElement>(`[data-setting-key="${key}"]`);
      const val = input?.value ?? "";
      if (val && isNaN(Number(val))) {
        errs.push({ field: key, message: `${key} must be a number` });
      }
    }
    setErrors(errs);
    if (errs.length > 0) return;

    try {
      const parsed: Record<string, string | boolean | number> = {};
      for (const el of document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-setting-key]")) {
        const key = el.getAttribute("data-setting-key")!;
        const value = el.value;
        if (value === "true") {
          parsed[key] = true;
        } else if (value === "false") {
          parsed[key] = false;
        } else if (/^\d+$/.test(value)) {
          parsed[key] = Number(value);
        } else {
          parsed[key] = value;
        }
      }
      await updateSettings(parsed as Partial<PlatformSettings>);
      showToast({ type: "success", title: "Settings saved" });
    } catch (e) {
      showToast({ type: "error", title: "Failed to save settings", message: e instanceof Error ? e.message : String(e) });
    }
  };

  const getError = (field: string) => errors.find((e) => e.field === field);

  const settingFields: { key: string; label: string; type: string }[] = [
    { key: "SITE_NAME", label: "Site Name", type: "text" },
    { key: "SITE_DESCRIPTION", label: "Site Description", type: "text" },
    { key: "XP_PER_MISSION", label: "XP Per Mission", type: "number" },
    { key: "MISSION_COOLDOWN_MINUTES", label: "Mission Cooldown (minutes)", type: "number" },
    { key: "MAX_DAILY_MISSIONS", label: "Max Daily Missions", type: "number" },
    { key: "REDEMPTION_APPROVAL_REQUIRED", label: "Approval Required", type: "select" },
    { key: "MIN_XP_FOR_REDEMPTION", label: "Min XP for Redemption", type: "number" },
    { key: "LISTEN_XP_PER_MINUTE", label: "Listen XP Per Minute", type: "number" },
    { key: "LISTEN_XP_DAILY_CAP", label: "Listen XP Daily Cap", type: "number" },
  ];

  function getSetting(key: string): string {
    if (!settings) return "";
    const val = (settings as unknown as Record<string, unknown>)[key];
    return val != null ? String(val).replace(/^"|"$/g, "") : "";
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-gray-500">Manage your profile and platform configuration</p>
      </div>

      <section key={`profile-${profile?.id ?? "none"}`} className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <User className="text-[#bda752]" size={24} />
          <h2 className="text-xl font-black">Admin Profile</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Display Name *</label>
            <input
              ref={displayNameRef}
              defaultValue={profile?.display_name ?? ""}
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752] ${
                getError("displayName") ? "border-red-400" : ""
              }`}
              placeholder="Your display name"
            />
            {getError("displayName") && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                {getError("displayName")?.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Email</label>
            <input
              value={profile?.email ?? ""}
              disabled
              className="w-full cursor-not-allowed rounded-xl border bg-gray-100 px-4 py-3 text-gray-400 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-600">Avatar URL</label>
            <input
              ref={avatarUrlRef}
              defaultValue={profile?.avatar_url ?? ""}
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752] ${
                getError("avatarUrl") ? "border-red-400" : ""
              }`}
              placeholder="https://example.com/avatar.jpg"
            />
            {getError("avatarUrl") && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                {getError("avatarUrl")?.message}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isUpdatingProfile}
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#bda752] px-6 py-3 font-bold text-white transition hover:bg-[#a8933e] disabled:opacity-50"
        >
          <Save size={18} />
          {isUpdatingProfile ? "Saving..." : "Save Profile"}
        </button>
      </section>

      <section key={`settings-${Object.keys(settings ?? {}).length}`} className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Settings2 className="text-[#bda752]" size={24} />
          <h2 className="text-xl font-black">Platform Configuration</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {settingFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-semibold text-gray-600">
                {field.label}
              </label>

              {field.type === "select" ? (
                <select
                  data-setting-key={field.key}
                  defaultValue={getSetting(field.key) || "true"}
                  className="w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752]"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <input
                  type={field.type}
                  data-setting-key={field.key}
                  defaultValue={getSetting(field.key)}
                  className={`w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752] ${
                    getError(field.key) ? "border-red-400" : ""
                  }`}
                />
              )}

              {getError(field.key) && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {getError(field.key)?.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isUpdatingSettings}
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#bda752] px-6 py-3 font-bold text-white transition hover:bg-[#a8933e] disabled:opacity-50"
        >
          <Save size={18} />
          {isUpdatingSettings ? "Saving..." : "Save Settings"}
        </button>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Globe className="text-[#bda752]" size={24} />
          <h2 className="text-xl font-black">WordPress Integration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Site URL</label>
            <a
              href="https://voksradio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#bda752] hover:underline"
            >
              https://voksradio.com
              <ExternalLink size={14} />
            </a>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">REST API</label>
            <a
              href="https://voksradio.com/wp-json/wp/v2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#bda752] hover:underline"
            >
              https://voksradio.com/wp-json/wp/v2
              <ExternalLink size={14} />
            </a>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Notification CPT</label>
            <a
              href="https://voksradio.com/wp-json/wp/v2/notification?_embed"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#bda752] hover:underline"
            >
              https://voksradio.com/wp-json/wp/v2/notification?_embed
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">How it works</p>
            <p className="mt-1 text-blue-600">
              WordPress provides the content (missions, rewards, programs, articles, promos, notifications).
              The admin panel imports content from WordPress to use in broadcasts and other features.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
