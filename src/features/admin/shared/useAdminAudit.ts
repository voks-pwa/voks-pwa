import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import type { AdminAuditEntry } from './types';

export function useAdminAudit(limit = 50) {
  return useQuery<AdminAuditEntry[]>({
    queryKey: ['admin-audit-log', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data ?? []) as AdminAuditEntry[];
    },
  });
}

export function useWriteAdminAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      actorId,
      actorName,
      action,
      entity,
      entityId,
      details,
    }: Omit<AdminAuditEntry, 'id' | 'createdAt'> & { details?: string | null }) => {
      const { error } = await supabase.from('admin_audit_log').insert({
        actor_id: actorId,
        actor_name: actorName,
        action,
        entity,
        entity_id: entityId,
        details,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
    },
  });
}
