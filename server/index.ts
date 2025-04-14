import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db"; // importar sua conexão
import tasksRouter from "./routes/tasks";


// Array simples para armazenar os usuários
const users: Array<{
  googleId: string;
  email: string | null;
  name: string;
}> = [];


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/tasks", tasksRouter);

// 4. CORS – habilita comunicação entre frontend e backend
app.use(cors({
  origin: "http://localhost:5000", // seu frontend React
  credentials: true                // permite cookies de sessão
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: "alguma_chave_secreta", // você pode gerar uma frase aleatória
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // use true se for https
    maxAge: 1000 * 60 * 60 * 24, // 1 dia de sessão
  }
}));


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

import { db } from "./db"; // importar sua conexão

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE google_id = ?",
      [profile.id]
    );

    let user = rows[0];

    if (!user) {
      const [result] = await db.query(
        "INSERT INTO users (google_id, name, email, profile_picture) VALUES (?, ?, ?, ?)",
        [
          profile.id,
          profile.displayName,
          profile.emails?.[0]?.value || "",
          profile.photos?.[0]?.value || null,
        ]
      );

      user = {
        id: result.insertId,
        google_id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value || "",
        profile_picture: profile.photos?.[0]?.value || null,
      };
    }

    return done(null, user);
  } catch (error) {
    console.error("Erro ao autenticar com Google:", error);
    return done(error, null);
  }
}));



passport.serializeUser((user: any, done) => {
  done(null, user.google_id);
});

passport.deserializeUser(async (googleId, done) => {
  const [rows]: any = await db.query(
    "SELECT * FROM users WHERE google_id = ?",
    [googleId]
  );
  const user = rows[0];
  done(null, user || null);
});



app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Redireciona para o dashboard após o login bem-sucedido
    res.redirect('http://localhost:5000/dashboard');
  }
);

app.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }

  res.json({ user: req.user });
});



app.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Não autenticado" });
  res.json(req.user);
});


(async () => {
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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
