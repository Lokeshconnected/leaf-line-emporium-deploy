import { Router } from "express";
import { db } from "@workspace/db";
import { donationsTable, plantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { randomUUID } from "crypto";

const router = Router();

function parseDonation(d: typeof donationsTable.$inferSelect) {
  return { ...d, amount: parseFloat(String(d.amount)) };
}

router.get("/", requireAuth, async (req, res) => {
  const donations = await db.select().from(donationsTable).where(eq(donationsTable.userId, req.user!.id));
  res.json(donations.map(parseDonation));
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [donation] = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
  if (!donation || donation.userId !== req.user!.id) {
    res.status(404).json({ message: "Donation not found" });
    return;
  }
  res.json(parseDonation(donation));
});

router.post("/", requireAuth, async (req, res) => {
  const { plantId, location, donorName } = req.body;
  if (!plantId || !location || !donorName) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  const [plant] = await db.select().from(plantsTable).where(eq(plantsTable.id, plantId)).limit(1);
  if (!plant) {
    res.status(404).json({ message: "Plant not found" });
    return;
  }

  const certificateId = `LEAF-${randomUUID().split("-")[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const amount = parseFloat(String(plant.price));

  const [donation] = await db.insert(donationsTable).values({
    userId: req.user!.id,
    plantId: plant.id,
    plantName: plant.name,
    donorName,
    location,
    certificateId,
    amount: String(amount),
  }).returning();

  res.status(201).json(parseDonation(donation));
});

export default router;
