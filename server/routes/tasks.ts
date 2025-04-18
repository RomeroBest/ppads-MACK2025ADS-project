import { Router } from "express";
import { db } from "../db";
import { tasks } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(tasks).orderBy(desc(tasks.dueDate));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar tarefas" });
  }
});

// POST new task
router.post("/", verifyToken, async (req, res) => {
  const { title, description, priority, dueDate, tag } = req.body;

  try {
    const inserted = await db.insert(tasks).values({
      title,
      description,
      priority,
      dueDate,
      tag,
      userId: req.user?.id ?? (() => { throw new Error("Usuário não autenticado"); })(), // ← agora garantido pelo token
    });

    res.status(201).json({ message: "Tarefa criada com sucesso" });
  } catch (err) {
    console.error("Erro ao salvar tarefa:", err);
    res.status(500).json({ message: "Erro interno ao salvar tarefa" });
  }
});


// PUT update task
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, priority, dueDate, tag } = req.body;

    await db.update(tasks)
      .set({ title, description, priority, dueDate, tag })
      .where(eq(tasks.id, taskId));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar tarefa" });
  }
});

// DELETE task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    await db.delete(tasks).where(eq(tasks.id, taskId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar tarefa" });
  }
});

export default router;
