import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, plantsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

async function getCartWithPlants(userId: number) {
  const items = await db
    .select({
      id: cartItemsTable.id,
      plantId: cartItemsTable.plantId,
      quantity: cartItemsTable.quantity,
      plant: {
        id: plantsTable.id,
        name: plantsTable.name,
        scientificName: plantsTable.scientificName,
        price: plantsTable.price,
        originalPrice: plantsTable.originalPrice,
        category: plantsTable.category,
        difficulty: plantsTable.difficulty,
        lightRequirement: plantsTable.lightRequirement,
        wateringFrequency: plantsTable.wateringFrequency,
        petSafe: plantsTable.petSafe,
        airPurificationRating: plantsTable.airPurificationRating,
        indoor: plantsTable.indoor,
        description: plantsTable.description,
        careInstructions: plantsTable.careInstructions,
        recommendedPlacement: plantsTable.recommendedPlacement,
        growthSpeed: plantsTable.growthSpeed,
        humidityRequirement: plantsTable.humidityRequirement,
        emoji: plantsTable.emoji,
        gradient: plantsTable.gradient,
        badge: plantsTable.badge,
        popularity: plantsTable.popularity,
      },
    })
    .from(cartItemsTable)
    .innerJoin(plantsTable, eq(cartItemsTable.plantId, plantsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  return items.map(item => ({
    ...item,
    plant: {
      ...item.plant,
      price: parseFloat(String(item.plant.price)),
      originalPrice: item.plant.originalPrice ? parseFloat(String(item.plant.originalPrice)) : null,
    }
  }));
}

router.get("/", requireAuth, async (req, res) => {
  const cart = await getCartWithPlants(req.user!.id);
  res.json(cart);
});

router.post("/items", requireAuth, async (req, res) => {
  const { plantId, quantity } = req.body;
  if (!plantId || !quantity) { res.status(400).json({ message: "Invalid input" }); return; }

  const userId = req.user!.id;

  // Check if already in cart
  const existing = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.plantId, plantId))).limit(1);

  if (existing.length > 0) {
    await db.update(cartItemsTable)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ userId, plantId, quantity });
  }

  const cart = await getCartWithPlants(userId);
  const item = cart.find(c => c.plantId === plantId);
  res.json(item);
});

router.put("/items/:plantId", requireAuth, async (req, res) => {
  const plantId = parseInt(req.params.plantId);
  const { quantity } = req.body;
  const userId = req.user!.id;

  if (quantity <= 0) {
    await db.delete(cartItemsTable)
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.plantId, plantId)));
    res.status(204).send();
    return;
  }

  await db.update(cartItemsTable)
    .set({ quantity })
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.plantId, plantId)));

  const cart = await getCartWithPlants(userId);
  const item = cart.find(c => c.plantId === plantId);
  res.json(item);
});

router.delete("/items/:plantId", requireAuth, async (req, res) => {
  const plantId = parseInt(req.params.plantId);
  const userId = req.user!.id;
  await db.delete(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.plantId, plantId)));
  res.status(204).send();
});

router.delete("/", requireAuth, async (req, res) => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.user!.id));
  res.status(204).send();
});

export default router;
