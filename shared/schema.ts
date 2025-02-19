import { pgTable, text, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const towers = pgTable("towers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  height: numeric("height").notNull(),
  transmissionPower: numeric("transmission_power").notNull(),
  frequency: numeric("frequency").notNull(),
  antennaGain: numeric("antenna_gain").notNull(),
});

export const insertTowerSchema = createInsertSchema(towers, {
  name: z.string().min(1, "Name is required"),
  latitude: z.number(),
  longitude: z.number(),
  height: z.number(),
  transmissionPower: z.number(),
  frequency: z.number(),
  antennaGain: z.number(),
}).omit({ id: true });

export type InsertTower = z.infer<typeof insertTowerSchema>;
export type Tower = typeof towers.$inferSelect;