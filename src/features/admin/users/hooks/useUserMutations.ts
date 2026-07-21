import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useWriteAdminAudit } from '@/features/admin/shared/useAdminAudit';
import { useProfile } from '@/features/profile/hooks/useProfile';

import type { AdminUser } from '../types';

interface UpdateUserRoleInput {
  id: string;
  role: AdminUser['role'];
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const writeAudit = useWriteAdminAudit();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ id, role }: UpdateUserRoleInput) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id);

      if (error) {
        throw error;
      }

      await writeAudit.mutateAsync({
        actorId: profile?.id ?? null,
        actorName: profile?.display_name ?? profile?.email ?? 'admin',
        action: 'role_update',
        entity: 'user_profile',
        entityId: id,
        details: `User role updated to ${role}`,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export async function banUser(userId: string, actorId?: string) {
  const { error } = await supabase.functions.invoke("admin-user-actions", {
    body: { action: "ban", userId, actorId },
  });
  if (error) throw error;
}

export async function unbanUser(userId: string, actorId?: string) {
  const { error } = await supabase.functions.invoke("admin-user-actions", {
    body: { action: "unban", userId, actorId },
  });
  if (error) throw error;
}

export async function deleteUser(userId: string, actorId?: string) {
  const { error } = await supabase.functions.invoke("admin-user-actions", {
    body: { action: "delete", userId, actorId },
  });
  if (error) throw error;
}

export async function adjustUserVxp(userId: string, amount: number, reason: string, actorId?: string) {
  const { error } = await supabase.functions.invoke("admin-user-actions", {
    body: { action: "adjust_vxp", userId, amount, reason, actorId },
  });
  if (error) throw error;
}

export function useBanUser() {
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (userId: string) => {
      await banUser(userId, profile?.id);
    },
  });
}

export function useUnbanUser() {
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (userId: string) => {
      await unbanUser(userId, profile?.id);
    },
  });
}

export function useDeleteUser() {
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (userId: string) => {
      await deleteUser(userId, profile?.id);
    },
  });
}

export function useAdjustVxp() {
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      await adjustUserVxp(userId, amount, reason, profile?.id);
    },
  });
}
