import { pgTable, text, varchar, timestamp, real, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// QA Table
export const qaTable = pgTable("qa", {
  id: serial("id").primaryKey(),
  question_id: varchar("question_id", { length: 255 }).notNull(),
  question: text("question").notNull(),
  pre_conf: real("pre_conf").notNull(),
  post_conf: real("post_conf").notNull(),
  answer: text("answer").notNull(),
  citations: jsonb("citations").$type<Array<{ id: string; title: string; url: string }>>().notNull().default([]),
  used_ids: jsonb("used_ids").$type<string[]>().notNull().default([]),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type QA = typeof qaTable.$inferSelect;
export type InsertQA = typeof qaTable.$inferInsert;

// Log Table
export const logTable = pgTable("log", {
  id: serial("id").primaryKey(),
  ts: timestamp("ts").defaultNow().notNull(),
  level: varchar("level", { length: 20 }).notNull(),
  message: text("message").notNull(),
  meta: jsonb("meta").$type<Record<string, any>>(),
});

export type Log = typeof logTable.$inferSelect;
export type InsertLog = typeof logTable.$inferInsert;

// Cache Table
export const cacheTable = pgTable("cache", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 500 }).notNull().unique(),
  value: jsonb("value").notNull(),
  ts: timestamp("ts").defaultNow().notNull(),
  ttl: real("ttl").notNull(),
});

export type CacheEntry = typeof cacheTable.$inferSelect;

// TypeScript interfaces for OpenAlex data
export interface OpenAlexWork {
  id: string;
  title: string;
  abstract: string;
  year: number;
  authors: Array<{ name: string }>;
  url: string;
  source: 'openalex';
}

export interface RankedWork extends OpenAlexWork {
  score: number;
}

// Validation schemas
export const insertQASchema = createInsertSchema(qaTable).omit({ id: true, created_at: true });
export const insertLogSchema = createInsertSchema(logTable).omit({ id: true, ts: true });

export const askRequestSchema = z.object({
  question: z.string().min(1, "Question is required"),
});

export const searchRequestSchema = z.object({
  question: z.string().min(1),
});

export const fetchRequestSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export const answerRequestSchema = z.object({
  question: z.string().min(1),
  passages: z.array(z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    passage: z.string(),
  })),
});
