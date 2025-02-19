import { pgTable, text, serial, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define available localities with their approximate areas and coordinates
export const INDIAN_LOCALITIES = [
  { 
    id: "andheri", 
    name: "Andheri, Mumbai", 
    areaKm2: 25,
    center: { lat: 19.1136, lng: 72.8697 },
    bounds: {
      north: 19.1236,
      south: 19.1036,
      east: 72.8797,
      west: 72.8597
    }
  },
  { 
    id: "whitefield", 
    name: "Whitefield, Bangalore", 
    areaKm2: 18,
    center: { lat: 12.9698, lng: 77.7499 },
    bounds: {
      north: 12.9798,
      south: 12.9598,
      east: 77.7599,
      west: 77.7399
    }
  },
  { 
    id: "gurgaon", 
    name: "Gurgaon, Delhi NCR", 
    areaKm2: 30,
    center: { lat: 28.4595, lng: 77.0266 },
    bounds: {
      north: 28.4695,
      south: 28.4495,
      east: 77.0366,
      west: 77.0166
    }
  },
  { 
    id: "salt_lake", 
    name: "Salt Lake City, Kolkata", 
    areaKm2: 12,
    center: { lat: 22.5806, lng: 88.4089 },
    bounds: {
      north: 22.5906,
      south: 22.5706,
      east: 88.4189,
      west: 88.3989
    }
  },
  { 
    id: "hitech_city", 
    name: "HITEC City, Hyderabad", 
    areaKm2: 20,
    center: { lat: 17.4435, lng: 78.3772 },
    bounds: {
      north: 17.4535,
      south: 17.4335,
      east: 78.3872,
      west: 78.3672
    }
  }
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
  // Position within locality
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
});

export const insertTowerSchema = createInsertSchema(towers, {
  name: z.string().min(1, "Name is required"),
  locality: z.enum(INDIAN_LOCALITIES.map(l => l.id) as [string, ...string[]]),
  height: z.number().min(10).max(100),
  transmissionPower: z.number().min(20).max(60),
  frequency: z.number().min(700).max(6000),
  antennaGain: z.number().min(0).max(30),
  latitude: z.number(),
  longitude: z.number(),
}).omit({ id: true });

export type InsertTower = z.infer<typeof insertTowerSchema>;
export type Tower = typeof towers.$inferSelect;

// Typical 5G tower coverage radius in urban areas (in kilometers)
export const TOWER_COVERAGE_RADIUS_KM = 1;

// Site scoring weights
export const SITE_SCORE_WEIGHTS = {
  terrain: 0.4,
  accessibility: 0.3,
  distance: 0.2,
  environment: 0.1
};