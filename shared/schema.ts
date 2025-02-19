import { pgTable, text, serial, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define available localities with their approximate areas and coordinates
export const INDIAN_LOCALITIES = [
  { 
    id: "pune_district", 
    name: "Pune District, Maharashtra", 
    areaKm2: 15643,
    center: { lat: 18.5204, lng: 73.8567 },
    bounds: {
      north: 19.2813,
      south: 17.9921,
      east: 74.5196,
      west: 73.2758
    }
  },
  { 
    id: "coimbatore_district", 
    name: "Coimbatore District, Tamil Nadu", 
    areaKm2: 7469,
    center: { lat: 11.0168, lng: 76.9558 },
    bounds: {
      north: 11.3367,
      south: 10.5065,
      east: 77.3826,
      west: 76.5066
    }
  },
  { 
    id: "surat_district", 
    name: "Surat District, Gujarat", 
    areaKm2: 4418,
    center: { lat: 21.1702, lng: 72.8311 },
    bounds: {
      north: 21.4834,
      south: 20.8444,
      east: 73.2226,
      west: 72.4954
    }
  },
  { 
    id: "lucknow_district", 
    name: "Lucknow District, Uttar Pradesh", 
    areaKm2: 2528,
    center: { lat: 26.8467, lng: 80.9462 },
    bounds: {
      north: 27.0687,
      south: 26.5967,
      east: 81.3464,
      west: 80.5950
    }
  },
  { 
    id: "vizag_district", 
    name: "Visakhapatnam District, Andhra Pradesh", 
    areaKm2: 11161,
    center: { lat: 17.6868, lng: 83.2185 },
    bounds: {
      north: 18.1969,
      south: 17.1731,
      east: 83.6804,
      west: 82.7930
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