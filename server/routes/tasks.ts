import { Router } from "express";
import { db } from "../db";

const router = Router();

// GET all tasks
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM tasks ORDER BY dueDate ASC");
  res.json(rows);
});

// POST new task
router.post("/", async (req, res) => {
  const { title, description, priority, dueDate, tag } = req.body;
  const [result] = await db.query(
    "INSERT INTO tasks (title, description, priority, dueDate, tag) VALUES (?, ?, ?, ?, ?)",
    [title, description, priority, dueDate, tag]
  );
  res.json({ id: result.insertId });
});

// PUT update task
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, dueDate, tag } = req.body;

  await db.query(
    "UPDATE tasks SET title = ?, description = ?, priority = ?, dueDate = ?, tag = ? WHERE id = ?",
    [title, description, priority, dueDate, tag, id]
  );

  res.json({ success: true });
});

// DELETE task
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM tasks WHERE id = ?", [id]);
  res.json({ success: true });
});

export default router;
