import { pgTable, text, serial, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define available localities with their approximate areas and coordinates
export const INDIAN_LOCALITIES = [
  { 
    id: "andheri_west", 
    name: "Andheri West, Mumbai", 
    areaKm2: 12.5,
    center: { lat: 19.1364, lng: 72.8296 },
    bounds: {
      north: 19.1584,
      south: 19.1144,
      east: 72.8496,
      west: 72.8096
    }
  },
  { 
    id: "koramangala", 
    name: "Koramangala, Bangalore", 
    areaKm2: 7.8,
    center: { lat: 12.9346, lng: 77.6205 },
    bounds: {
      north: 12.9446,
      south: 12.9246,
      east: 77.6405,
      west: 77.6005
    }
  },
  { 
    id: "hauz_khas", 
    name: "Hauz Khas, Delhi", 
    areaKm2: 6.2,
    center: { lat: 28.5494, lng: 77.2001 },
    bounds: {
      north: 28.5594,
      south: 28.5394,
      east: 77.2201,
      west: 77.1801
    }
  },
  { 
    id: "adyar", 
    name: "Adyar, Chennai", 
    areaKm2: 9.3,
    center: { lat: 13.0012, lng: 80.2565 },
    bounds: {
      north: 13.0112,
      south: 12.9912,
      east: 80.2765,
      west: 80.2365
    }
  },
  { 
    id: "banjara_hills", 
    name: "Banjara Hills, Hyderabad", 
    areaKm2: 8.9,
    center: { lat: 17.4156, lng: 78.4347 },
    bounds: {
      north: 17.4256,
      south: 17.4056,
      east: 78.4547,
      west: 78.4147
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