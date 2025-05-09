import { InsertTask, InsertUser, Task, TaskFormValues, User, users, tasks } from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Task operations
  getTaskById(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: TaskFormValues): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private userId: number;
  private taskId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.userId = 1;
    this.taskId = 1;
  }

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }

    const updatedUser: User = {
      ...user,
      ...userData,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!this.users.has(id)) {
      return false;
    }
    
    // Also delete all tasks for this user
    const userTasks = await this.getTasksByUserId(id);
    for (const task of userTasks) {
      await this.deleteTask(task.id);
    }
    
    return this.users.delete(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      role: insertUser.role || 'user',
      googleId: insertUser.googleId || null,
      profilePicture: insertUser.profilePicture || null,
      name: insertUser.name || null
    };
    this.users.set(id, user);
    return user;
  }

  // Task Operations
  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id,
      createdAt: now,
      description: insertTask.description || null,
      completed: insertTask.completed || false
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: TaskFormValues): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) {
      return undefined;
    }

    const updatedTask: Task = {
      ...task,
      title: taskUpdate.title,
      description: taskUpdate.description || null,
      priority: taskUpdate.priority,
      dueDate: taskUpdate.dueDate,
      tag: taskUpdate.tag,
      completed: taskUpdate.completed
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    if (!this.tasks.has(id)) {
      return false;
    }
    return this.tasks.delete(id);
  }
}

// Create a DatabaseStorage class that implements IStorage
export class DatabaseStorage implements IStorage {
  private userSequence: number = 1;
  private taskSequence: number = 1;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    // First delete all tasks associated with this user
    await db.delete(tasks).where(eq(tasks.userId, id));
    
    // Then delete the user
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    return user;
  }

  // Task operations
  async getTaskById(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    
    return task;
  }

  async updateTask(id: number, taskUpdate: TaskFormValues): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
