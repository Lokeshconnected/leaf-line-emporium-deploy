import { pgTable, serial, text, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const plantsTable = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scientificName: text("scientific_name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // Easy, Moderate, Expert
  lightRequirement: text("light_requirement").notNull(),
  wateringFrequency: text("watering_frequency").notNull(),
  petSafe: boolean("pet_safe").notNull().default(false),
  airPurificationRating: integer("air_purification_rating").notNull().default(3), // 1-5
  indoor: boolean("indoor").notNull().default(true),
  description: text("description").notNull(),
  careInstructions: text("care_instructions").notNull(),
  recommendedPlacement: text("recommended_placement").notNull(),
  growthSpeed: text("growth_speed").notNull(), // Slow, Moderate, Fast
  humidityRequirement: text("humidity_requirement").notNull(), // Low, Medium, High
  emoji: text("emoji").notNull().default("🌿"),
  gradient: text("gradient").notNull().default("from-emerald-400/20 to-green-600/10"),
  badge: text("badge"),
  popularity: integer("popularity").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlantSchema = createInsertSchema(plantsTable).omit({ id: true, createdAt: true });
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plantsTable.$inferSelect;
