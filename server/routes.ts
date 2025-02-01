import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { tasks, type InsertTask } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  app.get("/api/tasks", async (_req, res) => {
    try {
      const allTasks = await db.select().from(tasks).orderBy(tasks.order);
      res.json(allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

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
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Error creating task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [existingTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, parseInt(id)));

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Build update object conditionally
      const updateData: Partial<InsertTask> = {
        title: req.body.title ?? existingTask.title,
        section: req.body.section ?? existingTask.section,
        completed: req.body.hasOwnProperty("completed")
          ? req.body.completed
          : existingTask.completed,
        order: req.body.hasOwnProperty("order")
          ? req.body.order
          : existingTask.order,
        overview: req.body.overview ?? existingTask.overview,
        details: req.body.details ?? existingTask.details,
        revisitDate: req.body.revisitDate !== undefined
          ? new Date(req.body.revisitDate)
          : existingTask.revisitDate,
        updatedAt: new Date(),
      };

      const [updatedTask] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, parseInt(id)))
        .returning();

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Error updating task" });
    }
  });

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
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}