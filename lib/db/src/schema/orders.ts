import { pgTable, serial, integer, text, decimal, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { plantsTable } from "./plants";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingName: text("shipping_name").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  paymentMethod: text("payment_method").notNull().default("card"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  plantId: integer("plant_id").notNull().references(() => plantsTable.id),
  plantName: text("plant_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
