import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import passport from "passport";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session
app.use(session({
  secret: "taskflow-secret-key", // In a real app, this would be an environment variable
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve the app on port 5000
  const port = 5000;
  
  // Kill any existing process on port 5000
  const cleanupPort = async () => {
    try {
      const { exec } = await import('child_process');
      await new Promise((resolve) => {
        exec(`fuser -k ${port}/tcp`, () => resolve(null));
      });
      // Wait a moment for the port to be freed
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error cleaning up port:', error);
    }
  };

  await cleanupPort();
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  }).on('error', async (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.log('Port in use, attempting cleanup...');
      await cleanupPort();
      // Try one more time
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    } else {
      throw error;
    }
  });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
