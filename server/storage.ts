import { InsertTask, InsertUser, Task, TaskFormValues, User } from "@shared/schema";


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
    return Array.from(this.users.values()).find(user => user.email === email);
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
      username: userData.username ?? user.username, // Garantir que o username seja mantido ou atualizado corretamente
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const parsedId = Number(id);
    console.log("IDs existentes:", Array.from(this.users.keys()));
    console.log("Tentando deletar o ID:", parsedId);
  
    if (!this.users.has(parsedId)) {
      console.log("Usuário não encontrado para exclusão.");
      return false;
    }
  
    // Exclui tarefas associadas
    const userTasks = await this.getTasksByUserId(parsedId);
    for (const task of userTasks) {
      await this.deleteTask(task.id);
    }
  
    return this.users.delete(parsedId);
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
      name: insertUser.name || null,
      username: insertUser.username || `user${id}`, // Garantir que o campo username esteja presente
      status: "active", // ✅ incluído para satisfazer o tipo User
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
      id,
      createdAt: now,
      title: insertTask.title,
      priority: insertTask.priority,
      dueDate: insertTask.dueDate,
      tag: insertTask.tag,
      userId: insertTask.userId,
      description: insertTask.description ?? null,
      completed: insertTask.completed ?? false,
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
      description: taskUpdate.description || "",
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

export const storage = new MemStorage();
