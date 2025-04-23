import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "supervisor", "user", "new_user"] }).default("new_user").notNull(),
  lastActive: timestamp("last_active").defaultNow(),
  totalActiveTime: integer("total_active_time").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true
});

// Game Names schema (for managing game names)
export const gameNames = pgTable("game_names", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull()
});

export const insertGameNameSchema = createInsertSchema(gameNames).pick({
  name: true,
  createdBy: true
});

// Month Record schema (for tracking months)
export const monthRecords = pgTable("month_records", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // E.g., "Month 1", "Month 2"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertMonthRecordSchema = createInsertSchema(monthRecords).pick({
  name: true,
  startDate: true,
  endDate: true,
  isActive: true,
  isLocked: true
});

// Product schema (enhanced to support separate account types and monthly organization)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gameAccount: text("game_account").notNull(),
  gameName: text("game_name").notNull(),
  category: text("category", { enum: ["Game Account", "In-Game Items"] }).notNull(),
  dateReceived: timestamp("date_received").defaultNow().notNull(),
  costPrice: real("cost_price").notNull(),
  sellingPrice: real("selling_price").notNull(),
  profit: real("profit").notNull(),
  status: text("status", { enum: ["available", "sold"] }).default("available").notNull(),
  evidence: text("evidence"),
  monthRecordId: integer("month_record_id").notNull(), // Reference to month record instead of month/year fields
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  gameAccount: true,
  gameName: true,
  category: true,
  dateReceived: true,
  costPrice: true,
  sellingPrice: true,
  profit: true,
  status: true,
  evidence: true,
  monthRecordId: true,
  userId: true
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["started", "in_progress", "completed"] }).default("started").notNull(),
  dueDate: timestamp("due_date"),
  assignedTo: integer("assigned_to"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  status: true,
  dueDate: true,
  assignedTo: true,
  createdBy: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GameName = typeof gameNames.$inferSelect;
export type InsertGameName = z.infer<typeof insertGameNameSchema>;

export type MonthRecord = typeof monthRecords.$inferSelect;
export type InsertMonthRecord = z.infer<typeof insertMonthRecordSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Validation schemas with extended validation
export const gameNameValidationSchema = insertGameNameSchema.extend({
  name: z.string().min(2, "Game name must be at least 2 characters")
});

export const productValidationSchema = insertProductSchema.extend({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  gameAccount: z.string().min(1, "Game account information is required"),
  gameName: z.string().min(1, "Game name is required"),
  costPrice: z.number().min(0, "Cost price must be a positive number"),
  sellingPrice: z.number().min(0, "Selling price must be a positive number")
});

export const taskValidationSchema = insertTaskSchema.extend({
  title: z.string().min(3, "Task title must be at least 3 characters"),
  description: z.string().optional()
});

export const userValidationSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().optional(),
  role: z.enum(["admin", "supervisor", "user", "new_user"])
}).refine(data => data.confirmPassword ? data.password === data.confirmPassword : true, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
