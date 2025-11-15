import { storage } from '../storage';

const DEFAULT_TTL = 3600;

export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const entry = await storage.getCache(key);
    if (!entry) return null;
    
    const age = Date.now() - entry.ts.getTime();
    if (age > entry.ttl * 1000) {
      await storage.deleteCache(key);
      return null;
    }
    
    return entry.value as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCache(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
  try {
    await storage.setCache(key, value, ttl);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}
