import { pgTable, text, serial, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define available localities with their approximate areas and coordinates
export const INDIAN_LOCALITIES = [
  { 
    id: "pune_city", 
    name: "Pune City Area, Maharashtra", 
    areaKm2: 331,
    center: { lat: 18.5204, lng: 73.8567 },
    bounds: {
      north: 18.6213,
      south: 18.4221,
      east: 73.9696,
      west: 73.7458
    }
  },
  { 
    id: "coimbatore_central", 
    name: "Coimbatore Central, Tamil Nadu", 
    areaKm2: 246,
    center: { lat: 11.0168, lng: 76.9558 },
    bounds: {
      north: 11.0867,
      south: 10.9465,
      east: 77.0326,
      west: 76.8766
    }
  },
  { 
    id: "surat_city", 
    name: "Surat City Zone, Gujarat", 
    areaKm2: 326,
    center: { lat: 21.1702, lng: 72.8311 },
    bounds: {
      north: 21.2434,
      south: 21.1144,
      east: 72.9026,
      west: 72.7754
    }
  },
  { 
    id: "lucknow_central", 
    name: "Lucknow Central Zone, Uttar Pradesh", 
    areaKm2: 310,
    center: { lat: 26.8467, lng: 80.9462 },
    bounds: {
      north: 26.9187,
      south: 26.7867,
      east: 81.0164,
      west: 80.8750
    }
  },
  { 
    id: "vizag_urban", 
    name: "Visakhapatnam Urban Zone, Andhra Pradesh", 
    areaKm2: 290,
    center: { lat: 17.6868, lng: 83.2185 },
    bounds: {
      north: 17.7569,
      south: 17.6231,
      east: 83.3004,
      west: 83.1530
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