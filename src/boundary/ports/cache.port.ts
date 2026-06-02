export const CACHE_PORT = Symbol("CACHE_PORT");

export interface ICachePort {
  setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  getJson<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}
