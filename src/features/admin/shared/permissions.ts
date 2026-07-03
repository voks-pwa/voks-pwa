import type { AdminRole } from './types';

export type AdminPermission = 'view_users' | 'manage_users' | 'view_redemptions' | 'manage_redemptions' | 'view_audit_log';

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  member: [],
  admin: ['view_users', 'view_redemptions', 'view_audit_log'],
  superadmin: ['view_users', 'manage_users', 'view_redemptions', 'manage_redemptions', 'view_audit_log'],
};

export function getAdminPermissions(role?: AdminRole | null) {
  if (!role) {
    return [] as AdminPermission[];
  }

  return rolePermissions[role] ?? [];
}

export function canAccess(permission: AdminPermission, role?: AdminRole | null) {
  return getAdminPermissions(role).includes(permission);
}
