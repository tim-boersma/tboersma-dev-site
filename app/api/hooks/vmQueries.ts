import { useMutation, useQuery, useQueryCache } from '@pinia/colada';
import vmService from '@/api/services/vmService';
import type { VmState } from '@/types/VmState';

export const vmQueryKeys = {
  all: ['vm'] as const,
  status: () => [...vmQueryKeys.all, 'status'] as const,
};

export function useVMStatusQuery(options?: { enabled?: boolean }): ReturnType<typeof useQuery<VmState | null>> {
  return useQuery({
    key: vmQueryKeys.status(),
    query: async () => {
      const { text, error } = await vmService.getStatus();
      if (error) throw error;
      return text as VmState;
    },
    staleTime: 0,
    gcTime: 0,
    enabled: options?.enabled ?? import.meta.client,
    placeholderData: (previousData) => previousData
  });
}

export function useToggleVMMutation() {
  const queryCache = useQueryCache();

  return useMutation({
    mutation: async (state: boolean) => {
      const { text, error } = await vmService.toggleVM(state);
      if (error) throw error;
      return text;
    },
    onSuccess: async () => {
      await queryCache.invalidateQueries({ key: vmQueryKeys.status(), exact: true });
    },
  });
}
