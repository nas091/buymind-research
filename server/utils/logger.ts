import { storage } from '../storage';
import type { InsertLog } from '@shared/schema';

export async function log(level: InsertLog['level'], message: string, meta?: Record<string, any>) {
  try {
    await storage.createLog({ level, message, meta });
    console.log(`[${level.toUpperCase()}] ${message}`, meta || '');
  } catch (error) {
    console.error('Failed to save log:', error);
  }
}
