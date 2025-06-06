import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const proxies = pgTable("proxies", {
  id: serial("id").primaryKey(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  type: text("type").notNull(), // 'http' | 'socks4' | 'socks5'
  country: text("country"),
  city: text("city"),
  source: text("source").notNull(),
  isWorking: boolean("is_working").default(false),
  responseTime: integer("response_time"), // in milliseconds
  lastTested: timestamp("last_tested"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountLists = pgTable("account_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  totalAccounts: integer("total_accounts").default(0),
  validAccounts: integer("valid_accounts").default(0),
  invalidAccounts: integer("invalid_accounts").default(0),
  status: text("status").default("pending"), // 'pending' | 'checking' | 'completed' | 'paused'
  progress: integer("progress").default(0),
  accounts: text("accounts").array(), // array of account strings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const checkResults = pgTable("check_results", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").references(() => accountLists.id),
  account: text("account").notNull(),
  platform: text("platform").notNull(),
  isValid: boolean("is_valid"),
  responseTime: integer("response_time"),
  errorMessage: text("error_message"),
  proxyUsed: text("proxy_used"),
  checkedAt: timestamp("checked_at").defaultNow(),
});

export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  totalAccounts: integer("total_accounts").default(0),
  validAccounts: integer("valid_accounts").default(0),
  invalidAccounts: integer("invalid_accounts").default(0),
  activeProxies: integer("active_proxies").default(0),
  activeChecks: integer("active_checks").default(0),
  queueSize: integer("queue_size").default(0),
  proxiesOnline: integer("proxies_online").default(0),
  totalProxies: integer("total_proxies").default(0),
  successRate: text("success_rate").default("0%"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'success' | 'warning' | 'error' | 'info'
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertProxySchema = createInsertSchema(proxies).omit({
  id: true,
  createdAt: true,
});

export const insertAccountListSchema = createInsertSchema(accountLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCheckResultSchema = createInsertSchema(checkResults).omit({
  id: true,
  checkedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Proxy = typeof proxies.$inferSelect;
export type InsertProxy = z.infer<typeof insertProxySchema>;
export type AccountList = typeof accountLists.$inferSelect;
export type InsertAccountList = z.infer<typeof insertAccountListSchema>;
export type CheckResult = typeof checkResults.$inferSelect;
export type InsertCheckResult = z.infer<typeof insertCheckResultSchema>;
export type SystemStats = typeof systemStats.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
