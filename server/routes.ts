import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, loginUserSchema, taskFormSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize with some sample users
  await initializeSampleData();

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validated = loginUserSchema.parse(req.body);
      const user = await storage.getUserByEmail(validated.email);
      
      if (!user || user.password !== validated.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // In a real app, you'd set up sessions and use proper authentication
      // For this prototype, we'll just return the user info
      return res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name || "User",
        username: user.username
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Task CRUD operations
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const tasks = await storage.getTasksByUserId(userId);
      return res.status(200).json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const validated = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(validated);
      return res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const validated = taskFormSchema.parse(req.body);
      const updatedTask = await storage.updateTask(taskId, validated);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      return res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete task" });
    }
  });

  app.patch("/api/tasks/:id/toggle", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(taskId, {
        ...task,
        completed: !task.completed
      });
      
      return res.status(200).json(updatedTask);
    } catch (error) {
      return res.status(500).json({ message: "Failed to toggle task completion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize some sample data for the prototype
async function initializeSampleData() {
  try {
    // Add a sample user if none exists
    const existingUser = await storage.getUserByEmail("user@example.com");
    
    if (!existingUser) {
      const sampleUser = await storage.createUser({
        username: "user",
        password: "password",
        email: "user@example.com",
        name: "John Doe"
      });
      
      // Add sample tasks for this user
      const sampleTasks = [
        {
          title: "Complete project proposal",
          description: "Draft and finalize the project proposal document for client review.",
          priority: "high",
          dueDate: "2023-06-25",
          tag: "Work",
          completed: false,
          userId: sampleUser.id
        },
        {
          title: "Buy groceries",
          description: "Purchase items for the week: fruits, vegetables, milk, and bread.",
          priority: "medium",
          dueDate: "2023-06-22",
          tag: "Personal",
          completed: true,
          userId: sampleUser.id
        },
        {
          title: "Schedule team meeting",
          description: "Coordinate with team members to set up the weekly progress meeting.",
          priority: "medium",
          dueDate: "2023-06-23",
          tag: "Work",
          completed: false,
          userId: sampleUser.id
        },
        {
          title: "Renew gym membership",
          description: "Visit the gym to renew monthly membership plan.",
          priority: "low",
          dueDate: "2023-06-30",
          tag: "Personal",
          completed: false,
          userId: sampleUser.id
        },
        {
          title: "Fix website bug",
          description: "Address the login page issue reported by users.",
          priority: "high",
          dueDate: "2023-06-21",
          tag: "Urgent",
          completed: false,
          userId: sampleUser.id
        }
      ];
      
      for (const task of sampleTasks) {
        await storage.createTask(task);
      }
    }
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}
