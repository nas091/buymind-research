import { qaTable, logTable, cacheTable, type QA, type Log, type CacheEntry, type InsertQA, type InsertLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // QA operations
  createQA(qa: InsertQA): Promise<QA>;
  getQAById(id: number): Promise<QA | undefined>;
  
  // Log operations
  createLog(log: InsertLog): Promise<Log>;
  getLogs(limit?: number): Promise<Log[]>;
  
  // Cache operations
  getCache(key: string): Promise<CacheEntry | undefined>;
  setCache(key: string, value: any, ttl: number): Promise<void>;
  deleteCache(key: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // QA operations
  async createQA(qa: InsertQA): Promise<QA> {
    const [created] = await db.insert(qaTable).values(qa).returning();
    return created;
  }

  async getQAById(id: number): Promise<QA | undefined> {
    const [qa] = await db.select().from(qaTable).where(eq(qaTable.id, id)).limit(1);
    return qa || undefined;
  }

  // Log operations
  async createLog(log: InsertLog): Promise<Log> {
    const [created] = await db.insert(logTable).values(log).returning();
    return created;
  }

  async getLogs(limit: number = 200): Promise<Log[]> {
    const logs = await db
      .select()
      .from(logTable)
      .orderBy(desc(logTable.ts))
      .limit(limit);
    
    return logs.reverse();
  }

  // Cache operations
  async getCache(key: string): Promise<CacheEntry | undefined> {
    const [entry] = await db.select().from(cacheTable).where(eq(cacheTable.key, key)).limit(1);
    return entry || undefined;
  }

  async setCache(key: string, value: any, ttl: number): Promise<void> {
    await db
      .insert(cacheTable)
      .values({ key, value, ttl })
      .onConflictDoUpdate({
        target: cacheTable.key,
        set: { value, ts: new Date(), ttl }
      });
  }

  async deleteCache(key: string): Promise<void> {
    await db.delete(cacheTable).where(eq(cacheTable.key, key));
  }
}

export const storage = new DatabaseStorage();
