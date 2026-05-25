import { pgTable, serial, integer, text, decimal, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { plantsTable } from "./plants";

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  plantId: integer("plant_id").notNull().references(() => plantsTable.id),
  plantName: text("plant_name").notNull(),
  donorName: text("donor_name").notNull(),
  location: text("location").notNull(),
  certificateId: text("certificate_id").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Donation = typeof donationsTable.$inferSelect;
