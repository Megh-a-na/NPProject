import { towers, type Tower, type InsertTower } from "@shared/schema";

export interface IStorage {
  getTowers(): Promise<Tower[]>;
  getTower(id: number): Promise<Tower | undefined>;
  createTower(tower: InsertTower): Promise<Tower>;
  updateTower(id: number, tower: Partial<InsertTower>): Promise<Tower | undefined>;
  deleteTower(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private towers: Map<number, Tower>;
  private currentId: number;

  constructor() {
    this.towers = new Map();
    this.currentId = 1;
  }

  async getTowers(): Promise<Tower[]> {
    return Array.from(this.towers.values());
  }

  async getTower(id: number): Promise<Tower | undefined> {
    return this.towers.get(id);
  }

  async createTower(insertTower: InsertTower): Promise<Tower> {
    const id = this.currentId++;
    const tower: Tower = { 
      id,
      name: insertTower.name,
      locality: insertTower.locality,
      height: insertTower.height.toString(),
      transmissionPower: insertTower.transmissionPower.toString(),
      frequency: insertTower.frequency.toString(),
      antennaGain: insertTower.antennaGain.toString(),
      positionX: insertTower.positionX.toString(),
      positionY: insertTower.positionY.toString()
    };
    this.towers.set(id, tower);
    return tower;
  }

  async updateTower(id: number, updates: Partial<InsertTower>): Promise<Tower | undefined> {
    const existing = this.towers.get(id);
    if (!existing) return undefined;

    const updated: Tower = {
      ...existing,
      ...Object.entries(updates).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: key === 'name' || key === 'locality' ? value : value?.toString()
      }), {} as Partial<Tower>)
    };

    this.towers.set(id, updated);
    return updated;
  }

  async deleteTower(id: number): Promise<boolean> {
    return this.towers.delete(id);
  }
}

export const storage = new MemStorage();