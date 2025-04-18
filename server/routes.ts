import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  loginUserSchema, 
  registerUserSchema, 
  taskFormSchema 
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { adminRouter } from "./routes/admin";
import tasksRouter from "./routes/tasks";
import { authRouter } from "./routes/auth";
import { generateToken } from "./utils/jwt";
import { verifyToken } from "./middlewares/verifyToken"; // Import verifyToken middleware


// Simple middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['user-id'] as string;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(parseInt(userId));
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin permission required." });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize with some sample users
  //await initializeSampleData();

  app.use("/api/auth", authRouter);      // ✅ Novo
  app.use("/api/admin", adminRouter); // agora /api/admin/users funciona!
  app.use("/api/tasks", tasksRouter);

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validated = registerUserSchema.parse(req.body);

      const existingUserByEmail = await storage.getUserByEmail(validated.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const existingUserByUsername = await storage.getUserByUsername(validated.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const newUser = await storage.createUser({
        ...validated,
        role: "user",
      });

      return res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      // In a real app, you would validate the Google token
      // For this prototype, we'll just check if the user exists by their Google ID
      // or create a new user if they don't
      const { googleId, email, name, profilePicture } = req.body;
      
      if (!googleId || !email || !name) {
        return res.status(400).json({ message: "Invalid Google auth data" });
      }
      
      let user = await storage.getUserByGoogleId(googleId);
      
      if (!user) {
        // User doesn't exist, create a new one
        // Generate a random username based on the email
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        
        user = await storage.createUser({
          username,
          email,
          name,
          password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2), // Random password
          googleId,
          profilePicture,
          role: 'user'
        });
      }
      
      return res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to authenticate with Google" });
    }
  });
  
  // Admin routes for user management
  app.get("/api/admin/users", verifyToken, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      console.log("Usuários existentes após inicialização:", users.map(u => u.id));
      // Don't return passwords in the response
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        googleId: user.googleId ? true : false, // Just indicate if connected to Google
        createdAt: user.createdAt
      }));
      
      return res.status(200).json(safeUsers);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.put("/api/admin/users/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate update fields - only allow limited fields to be updated by admin
      const { role, name } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        role,
        name,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.delete("/api/admin/users/:id", verifyToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
  
      
      const adminId = (req.user as { id: number }).id;
      if (userId === adminId) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
  
      const success = await storage.deleteUser(userId);
  
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete user" });
    }
  });
  

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validated = loginUserSchema.parse(req.body);
      const user = await storage.getUserByEmail(validated.email);
  
      if (!user || user.password !== validated.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      // ✅ Gera token JWT com as infos necessárias
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "user" | "admin",
        username: user.username, // ✅ importante
      });
      
  
      // Retorna o token e os dados básicos do usuário
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || "User",
          username: user.username,
          role: user.role,
          profilePicture: user.profilePicture,
        },
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
      
      const allowedTags = ["Work", "Personal", "Urgent", "Shopping"] as const;

      if (!allowedTags.includes(task.tag as any)) {
        return res.status(400).json({ message: "Invalid tag value" });
      }
      
      const updatedTask = await storage.updateTask(taskId, {
        title: task.title,
        description: task.description ?? "", // trata null
        priority: task.priority as "high" | "medium" | "low",
        dueDate: task.dueDate,
        tag: task.tag as "Work" | "Personal" | "Urgent" | "Shopping",
        completed: !task.completed,
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
    // Add a sample admin user if none exists
    const existingAdmin = await storage.getUserByEmail("admin@example.com");
    
    if (!existingAdmin) {
      await storage.createUser({
        username: "admin",
        password: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin"
      });
    }
    
    // Add a sample regular user if none exists
    const existingUser = await storage.getUserByEmail("user@example.com");
    
    if (!existingUser) {
      const sampleUser = await storage.createUser({
        username: "user",
        password: "password",
        email: "user@example.com",
        name: "John Doe",
        role: "user"
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
