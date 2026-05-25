import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, plantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

async function getOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    ...order,
    totalAmount: parseFloat(String(order.totalAmount)),
    items: items.map(i => ({ ...i, price: parseFloat(String(i.price)) })),
  };
}

router.get("/", requireAuth, async (req, res) => {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.user!.id));
  const result = await Promise.all(orders.map(o => getOrderWithItems(o.id)));
  res.json(result.filter(Boolean));
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const order = await getOrderWithItems(id);
  if (!order || order.userId !== req.user!.id) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  res.json(order);
});

router.post("/", requireAuth, async (req, res) => {
  const { shippingName, shippingAddress, shippingCity, shippingZip, paymentMethod } = req.body;
  const userId = req.user!.id;

  // Get cart items
  const cartItems = await db
    .select({ cartItem: cartItemsTable, plant: plantsTable })
    .from(cartItemsTable)
    .innerJoin(plantsTable, eq(cartItemsTable.plantId, plantsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  if (cartItems.length === 0) {
    res.status(400).json({ message: "Cart is empty" });
    return;
  }

  const totalAmount = cartItems.reduce((sum, { cartItem, plant }) => {
    return sum + parseFloat(String(plant.price)) * cartItem.quantity;
  }, 0);

  const [order] = await db.insert(ordersTable).values({
    userId,
    totalAmount: String(totalAmount),
    shippingName,
    shippingAddress,
    shippingCity,
    shippingZip,
    paymentMethod: paymentMethod || "card",
    status: "pending",
  }).returning();

  // Create order items
  await db.insert(orderItemsTable).values(
    cartItems.map(({ cartItem, plant }) => ({
      orderId: order.id,
      plantId: plant.id,
      plantName: plant.name,
      quantity: cartItem.quantity,
      price: plant.price,
    }))
  );

  // Clear cart
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  const result = await getOrderWithItems(order.id);
  res.status(201).json(result);
});

export default router;
