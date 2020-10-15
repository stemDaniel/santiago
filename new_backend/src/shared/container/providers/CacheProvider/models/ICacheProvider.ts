export default interface ICacheProvider {
    register(key: string, value: any): Promise<void>;
    recovery<T>(key: string): Promise<T | null>;
    invalidate(key: string): Promise<void>;
}
