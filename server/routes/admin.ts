import { Router } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";

const adminRouter = Router();



// GET /api/admin/users
adminRouter.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db
      .select({
        id: users.id,
        googleId: users.googleId,
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role,
        profilePicture: users.profilePicture,
        createdAt: users.createdAt,
      })
      .from(users);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ message: "Erro ao buscar usuários" });
  }
});

// PUT /api/admin/users/:id
adminRouter.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, username, email, role } = req.body;

  const updates: Record<string, string> = {};
  if (name) updates.name = name;
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (role) updates.role = role;

  try {
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No values provided for update" });
    }

    const result = await db.update(users)
    .set({ name, username, email, role })
    .where(eq(users.id, Number(id)));
  
  // Aqui não há retorno, então você pode verificar manualmente depois
  const updatedUser = await db.select().from(users).where(eq(users.id, Number(id))).then(r => r[0]);
  
  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }
  
  res.status(200).json({ message: "Usuário atualizado com sucesso" });
  
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ message: "Erro interno ao atualizar usuário" });
  }
});



// DELETE /api/admin/users/:id
adminRouter.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verifica se o usuário existe antes de deletar
    const existingUser = await db.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Realiza a exclusão
    await db.delete(users).where(eq(users.id, userId));
    return res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
});


export { adminRouter };
