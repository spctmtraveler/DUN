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
      console.error("Error fetching tasks:", error);
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
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Error creating task" });
    }
  });

  // Update task
  app.patch("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // Create an update object only with the fields that are present in the request
      const updateData: Partial<InsertTask> = {};

      const [existingTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, parseInt(id)));

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Only update completion status if provided
      if (req.body.completed !== undefined) {
        updateData.completed = req.body.completed;
      }

      // Only update order if provided
      if (req.body.order !== undefined) {
        updateData.order = req.body.order;
      }

      // Only update these fields if explicitly provided
      if (req.body.overview !== undefined) updateData.overview = req.body.overview;
      updateData.details = req.body.details ?? existingTask.details;
      if (req.body.revisitDate !== undefined) {
        updateData.revisitDate = new Date(req.body.revisitDate);
      }

      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date();

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
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}