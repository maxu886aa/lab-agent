import { scopedStorage } from '@lark-apaas/client-toolkit-lite';

const PREFIX = 'fsra_';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = scopedStorage.getItem(PREFIX + key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set(key: string, value: unknown): void {
    try {
      scopedStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove(key: string): void {
    try {
      scopedStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
};
