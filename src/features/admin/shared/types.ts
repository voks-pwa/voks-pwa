export type AdminRole = 'member' | 'admin' | 'superadmin' | 'banned';

export interface AdminTableState<T> {
  page: number;
  pageSize: number;
  search: string;
  sortKey: keyof T | null;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, string | null>;
}

export interface AdminAuditEntry {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  details: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}

export interface DateRange {
  from: string;
  to: string;
}
