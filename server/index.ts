import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db";
import tasksRouter from "./routes/tasks";
import cookieParser from "cookie-parser";
import { generateToken } from "./utils/jwt";
import { adminRouter } from "./routes/admin";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import path from "path";



const app = express();
const __dirname = path.resolve();


app.use(express.static(path.join(__dirname, "dist/public")));

const PORT = process.env.PORT || 5000;

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/public/index.html"));
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT || 5000);
});

app.use(cors({
  origin: "https://taskflow-frontend.up.railway.app"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/tasks", tasksRouter);
app.use("/api/admin", adminRouter);

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

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, async (_accessToken, _refreshToken, profile, done) => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.googleId, profile.id)).then(rows => rows[0]);

    if (existingUser) {
      return done(null, existingUser);
    }

    const username = profile.emails?.[0]?.value?.split("@")[0] || `user_${Date.now()}`;
    const email = profile.emails?.[0]?.value || "";
    const profilePicture = profile.photos?.[0]?.value || null;

    // Faz inserção
    await db.insert(users).values({
      googleId: profile.id,
      name: profile.displayName,
      email,
      profilePicture,
      username,
      password: Math.random().toString(36).slice(2),
    });

    // Reconsulta o usuário após inserção
    const newUser = await db.select().from(users).where(eq(users.googleId, profile.id)).then(rows => rows[0]);

    return done(null, newUser);
  } catch (error) {
    console.error("Erro ao autenticar com Google:", error);
    return done(error as Error, false);
  }
}));


app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req: any, res) => {
    const user = req.user;

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      username: user.username,
    });

    res.redirect(`https://tasktracker-api.onrender.com/login-success?token=${token}`);
  }
);

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
