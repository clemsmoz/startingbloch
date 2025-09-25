import { queryClient } from '../services/queryClient';
import { clientService, cabinetService, contactService, brevetService, paysService, roleService, statutsService } from '../services';

type ProgressCallback = (done: number, total: number) => void;

export async function prefetchAtLogin(onProgress?: ProgressCallback) {
  const tasks = [
    { key: ['countries'], fn: () => paysService.getAll() },
    { key: ['roles'], fn: () => roleService.getAll() },
    { key: ['statuts'], fn: () => statutsService.getAll() },
    { key: ['clients', 'summary'], fn: () => clientService.getAll(1, 20) },
    { key: ['cabinets', 'summary'], fn: () => cabinetService.getAll(1, 20) },
    { key: ['contacts', 'summary'], fn: () => contactService.getAll(1, 50) },
    { key: ['brevets', 'summary'], fn: () => brevetService.getAll(1, 20) },
    // brevet related smaller tables could be prefetched above (countries, roles, statuts)
  ];

  const total = tasks.length;
  let done = 0;

  await Promise.all(tasks.map(async (t) => {
    try {
      await queryClient.prefetchQuery(t.key as any, () => (t.fn as any)());
    } catch (e) {
      console.warn('prefetch failed', t.key, e);
    } finally {
      done += 1;
      onProgress?.(done, total);
    }
  }));
}

export default prefetchAtLogin;
