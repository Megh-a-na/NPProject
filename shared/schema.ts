import { pgTable, text, serial, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define available localities with their approximate areas in square kilometers
export const INDIAN_LOCALITIES = [
  { id: "andheri", name: "Andheri, Mumbai", areaKm2: 25 },
  { id: "whitefield", name: "Whitefield, Bangalore", areaKm2: 18 },
  { id: "gurgaon", name: "Gurgaon, Delhi NCR", areaKm2: 30 },
  { id: "salt_lake", name: "Salt Lake City, Kolkata", areaKm2: 12 },
  { id: "hitech_city", name: "HITEC City, Hyderabad", areaKm2: 20 }
] as const;

export const towers = pgTable("towers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  locality: text("locality").notNull(),
  // Tower specifications
  height: numeric("height").notNull(),
  transmissionPower: numeric("transmission_power").notNull(),
  frequency: numeric("frequency").notNull(),
  antennaGain: numeric("antenna_gain").notNull(),
  // Position within locality (0-1 range for relative positioning)
  positionX: numeric("position_x").notNull(),
  positionY: numeric("position_y").notNull(),
});

export const insertTowerSchema = createInsertSchema(towers, {
  name: z.string().min(1, "Name is required"),
  locality: z.enum(INDIAN_LOCALITIES.map(l => l.id) as [string, ...string[]]),
  height: z.number().min(10).max(100),
  transmissionPower: z.number().min(20).max(60),
  frequency: z.number().min(700).max(6000),
  antennaGain: z.number().min(0).max(30),
  positionX: z.number().min(0).max(1),
  positionY: z.number().min(0).max(1),
}).omit({ id: true });

export type InsertTower = z.infer<typeof insertTowerSchema>;
export type Tower = typeof towers.$inferSelect;

// Typical 5G tower coverage radius in urban areas (in kilometers)
export const TOWER_COVERAGE_RADIUS_KM = 1;