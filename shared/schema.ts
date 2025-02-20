import { pgTable, text, serial, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Update the INDIAN_LOCALITIES array with more realistic boundary coordinates
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
      west: 73.7458,
      // Polygon coordinates for accurate district boundary
      polygon: [
        [73.7458, 18.4821],
        [73.7958, 18.4221],
        [73.8567, 18.4321],
        [73.9196, 18.4521],
        [73.9696, 18.4921],
        [73.9596, 18.5421],
        [73.9396, 18.5821],
        [73.9096, 18.6213],
        [73.8567, 18.6113],
        [73.8067, 18.5913],
        [73.7658, 18.5421],
        [73.7458, 18.4821]
      ]
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
      west: 76.8766,
      // Polygon coordinates for accurate district boundary
      polygon: [
        [76.8766, 10.9865],
        [76.9066, 10.9465],
        [76.9558, 10.9565],
        [77.0026, 10.9765],
        [77.0326, 11.0165],
        [77.0126, 11.0567],
        [76.9858, 11.0867],
        [76.9458, 11.0767],
        [76.9058, 11.0467],
        [76.8866, 11.0167],
        [76.8766, 10.9865]
      ]
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
      west: 72.7754,
      // Polygon coordinates for accurate district boundary
      polygon: [
        [72.7754, 21.1544],
        [72.8054, 21.1144],
        [72.8511, 21.1244],
        [72.8826, 21.1444],
        [72.9026, 21.1844],
        [72.8926, 21.2134],
        [72.8726, 21.2434],
        [72.8411, 21.2334],
        [72.8111, 21.2134],
        [72.7854, 21.1844],
        [72.7754, 21.1544]
      ]
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
      west: 80.8750,
      // Polygon coordinates for accurate district boundary
      polygon: [
        [80.8750, 26.8267],
        [80.9050, 26.7867],
        [80.9462, 26.7967],
        [80.9864, 26.8167],
        [81.0164, 26.8567],
        [81.0064, 26.8887],
        [80.9864, 26.9187],
        [80.9462, 26.9087],
        [80.9062, 26.8887],
        [80.8850, 26.8567],
        [80.8750, 26.8267]
      ]
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
      west: 83.1530,
      // Polygon coordinates for accurate district boundary
      polygon: [
        [83.1530, 17.6631],
        [83.1830, 17.6231],
        [83.2185, 17.6331],
        [83.2604, 17.6531],
        [83.3004, 17.6931],
        [83.2904, 17.7269],
        [83.2704, 17.7569],
        [83.2285, 17.7469],
        [83.1885, 17.7169],
        [83.1630, 17.6931],
        [83.1530, 17.6631]
      ]
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