import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTowerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/towers", async (_req, res) => {
    const towers = await storage.getTowers();
    res.json(towers);
  });

  app.post("/api/towers", async (req, res) => {
    const result = insertTowerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const tower = await storage.createTower(result.data);
    res.status(201).json(tower);
  });

  app.patch("/api/towers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertTowerSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const tower = await storage.updateTower(id, result.data);
    if (!tower) {
      return res.status(404).json({ error: "Tower not found" });
    }
    res.json(tower);
  });

  app.delete("/api/towers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTower(id);
    if (!success) {
      return res.status(404).json({ error: "Tower not found" });
    }
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}