// server/middlewares/isAdmin.ts
import { Request, Response, NextFunction } from "express";

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (user?.role !== "admin") {
    return res.status(403).json({ message: "Acesso restrito a administradores" });
  }

  next();
}
