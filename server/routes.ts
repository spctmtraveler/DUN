import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { tasks, type InsertTask } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Get all tasks
  app.get("/api/tasks", async (_req, res) => {
    try {
      const allTasks = await db.select().from(tasks).orderBy(tasks.order);
      res.json(allTasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  // Create new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData: InsertTask = {
        title: req.body.title,
        section: req.body.section || "Triage",
        completed: false,
        order: req.body.order,
      };

      const [newTask] = await db.insert(tasks).values(taskData).returning();
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: "Error creating task" });
    }
  });

  // Update task
  app.patch("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [updatedTask] = await db
        .update(tasks)
        .set({
          title: req.body.title,
          section: req.body.section,
          completed: req.body.completed,
          order: req.body.order,
          overview: req.body.overview,
          details: req.body.details,
          revisitDate: req.body.revisitDate,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, parseInt(id)))
        .returning();

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [deletedTask] = await db
        .delete(tasks)
        .where(eq(tasks.id, parseInt(id)))
        .returning();

      if (!deletedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(deletedTask);
    } catch (error) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}