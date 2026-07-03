import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useWriteAdminAudit } from '@/features/admin/shared/useAdminAudit';
import { useProfile } from '@/hooks/useProfile';

import type { Profile } from '../types';

interface UpdateUserRoleInput {
  id: string;
  role: Profile['role'];
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
