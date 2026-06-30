export interface AdminUser {

  id: string;

  display_name: string | null;

  email: string | null;

  role: string | null;

  badge_name: string | null;

  level: number;

  xp: number;

  current_vxp: number;

  avatar_url: string | null;

  created_at: string;

}