export interface ICachePort {
    set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
    get(key: string): Promise<unknown>;
    delete(key: string): Promise<void>;
}
