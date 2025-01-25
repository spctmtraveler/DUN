import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { db } from "@db";
import { tasks, type InsertTask } from "@db/schema";
import { eq } from "drizzle-orm";

type TaskUpdate = {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  task: any;
};

export function registerRoutes(app: Express): Server {
  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    // Ignore Vite HMR connections
    verifyClient: ({ req }) => {
      const protocol = req.headers['sec-websocket-protocol'];
      return !protocol || protocol !== 'vite-hmr';
    }
  });

  // Handle WebSocket server errors
  wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
  });

  // Broadcast to all clients
  const broadcast = (update: TaskUpdate) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(update));
        } catch (error) {
          console.error('Error broadcasting to client:', error);
        }
      }
    });
  };

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
      broadcast({ type: 'CREATE', task: newTask });
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
      const updateData: Partial<InsertTask> = {};
      const [existingTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, parseInt(id)));

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      updateData.order = req.body.order ?? existingTask.order;
      updateData.overview = req.body.overview ?? existingTask.overview;
      updateData.details = req.body.details ?? existingTask.details;
      updateData.section = req.body.section ?? existingTask.section;
      updateData.completed = req.body.completed ?? existingTask.completed;
      if (req.body.revisitDate !== undefined) {
        updateData.revisitDate = new Date(req.body.revisitDate);
      }
      updateData.updatedAt = new Date();

      const [updatedTask] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, parseInt(id)))
        .returning();

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      broadcast({ type: 'UPDATE', task: updatedTask });
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
      broadcast({ type: 'DELETE', task: deletedTask });
      res.json(deletedTask);
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  return httpServer;
}