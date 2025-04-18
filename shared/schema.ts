import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("user"), // New: 'admin' or 'user'
  googleId: text("google_id").unique(), // New: for Google Auth
  profilePicture: text("profile_picture"), // New: URL to profile picture
  createdAt: timestamp("created_at").defaultNow(), // New: track when user was created
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

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // high, medium, low
  dueDate: text("dueDate").notNull(),
  tag: text("tag").notNull(), // Work, Personal, Urgent, Shopping
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

// For frontend form validation
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

// TaskFilter type for filtering tasks
export type TaskFilter = {
  status: "all" | "pending" | "completed";
  tag: string;
  search: string;
};
