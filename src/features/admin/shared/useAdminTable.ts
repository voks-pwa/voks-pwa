import { useMemo, useState } from 'react';

import type { AdminTableState } from './types';

export function useAdminTable<T extends Record<string, unknown>>(initialPageSize = 10) {
  const [state, setState] = useState<AdminTableState<T>>({
    page: 1,
    pageSize: initialPageSize,
    search: '',
    sortKey: null,
    sortDirection: 'asc',
    filters: {},
  });

  const pagedItems = useMemo(() => {
    return [] as T[];
  }, []);

  const setSearch = (search: string) => {
    setState((current) => ({ ...current, search, page: 1 }));
  };

  const setPage = (page: number) => {
    setState((current) => ({ ...current, page }));
  };

  const setFilters = (filters: Record<string, string | null>) => {
    setState((current) => ({ ...current, filters, page: 1 }));
  };

  const setSort = (sortKey: keyof T | null, sortDirection: 'asc' | 'desc') => {
    setState((current) => ({ ...current, sortKey, sortDirection, page: 1 }));
  };

  return {
    state,
    pagedItems,
    setSearch,
    setPage,
    setFilters,
    setSort,
  };
}
