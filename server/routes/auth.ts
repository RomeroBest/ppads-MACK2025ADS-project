import { Router } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { loginUserSchema } from "@shared/schema";
import { storage } from "../storage";
import { generateToken } from "../utils/jwt";

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const validated = loginUserSchema.parse(req.body);
    const user = await storage.getUserByEmail(validated.email);

    if (!user || user.password !== validated.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      username: user.username, // ✅ importante
    });
    

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

export { authRouter };
