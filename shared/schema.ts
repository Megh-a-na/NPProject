import { pgTable, text, serial, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define available localities with their approximate areas and coordinates
export const INDIAN_LOCALITIES = [
  { 
    id: "mumbai", 
    name: "Mumbai Metropolitan", 
    areaKm2: 603,
    center: { lat: 19.0760, lng: 72.8777 },
    bounds: {
      north: 19.2813,
      south: 18.8921,
      east: 73.0196,
      west: 72.7758
    }
  },
  { 
    id: "bangalore", 
    name: "Bangalore City", 
    areaKm2: 741,
    center: { lat: 12.9716, lng: 77.5946 },
    bounds: {
      north: 13.1367,
      south: 12.8065,
      east: 77.7826,
      west: 77.4066
    }
  },
  { 
    id: "delhi", 
    name: "Delhi NCR", 
    areaKm2: 1484,
    center: { lat: 28.6139, lng: 77.2090 },
    bounds: {
      north: 28.8834,
      south: 28.3444,
      east: 77.5226,
      west: 76.8954
    }
  },
  { 
    id: "chennai", 
    name: "Chennai City", 
    areaKm2: 426,
    center: { lat: 13.0827, lng: 80.2707 },
    bounds: {
      north: 13.2687,
      south: 12.8967,
      east: 80.3464,
      west: 80.1950
    }
  },
  { 
    id: "hyderabad", 
    name: "Hyderabad City", 
    areaKm2: 650,
    center: { lat: 17.3850, lng: 78.4867 },
    bounds: {
      north: 17.5969,
      south: 17.1731,
      east: 78.6804,
      west: 78.2930
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
export const TOWER_COVERAGE_RADIUS_KM = 4; // Average of 1-4 miles converted to km

// Site scoring weights
export const SITE_SCORE_WEIGHTS = {
  terrain: 0.4,
  accessibility: 0.3,
  distance: 0.2,
  environment: 0.1
};