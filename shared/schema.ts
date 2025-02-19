import { pgTable, text, serial, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define districts and their localities
export const DISTRICTS = [
  {
    id: "mumbai",
    name: "Mumbai",
    localities: [
      {
        id: "andheri_west",
        name: "Andheri West",
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
        id: "bandra",
        name: "Bandra",
        areaKm2: 7.2,
        center: { lat: 19.0596, lng: 72.8295 },
        bounds: {
          north: 19.0696,
          south: 19.0496,
          east: 72.8495,
          west: 72.8095
        }
      },
      {
        id: "dadar",
        name: "Dadar",
        areaKm2: 8.5,
        center: { lat: 19.0178, lng: 72.8478 },
        bounds: {
          north: 19.0278,
          south: 19.0078,
          east: 72.8678,
          west: 72.8278
        }
      }
    ]
  },
  {
    id: "bangalore",
    name: "Bangalore",
    localities: [
      {
        id: "koramangala",
        name: "Koramangala",
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
        id: "indiranagar",
        name: "Indiranagar",
        areaKm2: 5.9,
        center: { lat: 12.9719, lng: 77.6412 },
        bounds: {
          north: 12.9819,
          south: 12.9619,
          east: 77.6612,
          west: 77.6212
        }
      }
    ]
  },
  {
    id: "delhi",
    name: "Delhi",
    localities: [
      {
        id: "hauz_khas",
        name: "Hauz Khas",
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
        id: "connaught_place",
        name: "Connaught Place",
        areaKm2: 4.3,
        center: { lat: 28.6289, lng: 77.2074 },
        bounds: {
          north: 28.6389,
          south: 28.6189,
          east: 77.2274,
          west: 77.1874
        }
      }
    ]
  }
] as const;

export const towers = pgTable("towers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  district: text("district").notNull(),
  locality: text("locality").notNull(),
  height: numeric("height").notNull(),
  transmissionPower: numeric("transmission_power").notNull(),
  frequency: numeric("frequency").notNull(),
  antennaGain: numeric("antenna_gain").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
});

export const insertTowerSchema = createInsertSchema(towers, {
  name: z.string().min(1, "Name is required"),
  district: z.enum(DISTRICTS.map(d => d.id) as [string, ...string[]]),
  locality: z.string().min(1, "Locality is required"),
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