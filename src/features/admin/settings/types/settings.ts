export interface AdminProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  badge_name: string | null;
  role: string | null;
}

export interface PlatformSettings {
  XP_PER_MISSION: string;
  MISSION_COOLDOWN_MINUTES: string;
  MAX_DAILY_MISSIONS: string;
  REDEMPTION_APPROVAL_REQUIRED: string;
  MIN_XP_FOR_REDEMPTION: string;
  LISTEN_XP_PER_MINUTE: string;
  LISTEN_XP_DAILY_CAP: string;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
}

export interface SettingsResponse {
  profile: AdminProfile;
  settings: PlatformSettings;
}
