import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  boolean
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// USERS TABLE - PostgreSQL
export const users = pgTable("users", {
  id: integer("id").primaryKey().default(sql`nextval('users_id_seq')`),
  googleId: varchar("google_id", { length: 255 }),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }),
  role: varchar("role", { length: 10 }).default("user").notNull(),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
  googleId: true,
  profilePicture: true,
});

export const registerUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// TASKS TABLE - PostgreSQL
export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().default(sql`nextval('tasks_id_seq')`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 10 }).notNull(),
  dueDate: varchar("dueDate", { length: 50 }).notNull(),
  tag: varchar("tag", { length: 50 }).notNull(),
  completed: boolean("completed").notNull().default(false),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  dueDate: z.string().min(1, "Due date is required"),
  tag: z.enum(["Work", "Personal", "Urgent", "Shopping"]),
  completed: z.boolean().default(false),
  userId: z.number().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export type TaskFilter = {
  status: "all" | "pending" | "completed";
  tag: string;
  search: string;
};
