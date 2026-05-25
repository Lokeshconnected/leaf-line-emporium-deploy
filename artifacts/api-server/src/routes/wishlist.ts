import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await db.select({ plantId: wishlistTable.plantId })
    .from(wishlistTable).where(eq(wishlistTable.userId, req.user!.id));
  res.json(items.map(i => i.plantId));
});

router.post("/", requireAuth, async (req, res) => {
  const { plantId } = req.body;
  if (!plantId) { res.status(400).json({ message: "plantId required" }); return; }
  const userId = req.user!.id;

  const existing = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.plantId, plantId))).limit(1);

  if (existing.length === 0) {
    await db.insert(wishlistTable).values({ userId, plantId });
  }
  res.json({ success: true });
});

router.delete("/:plantId", requireAuth, async (req, res) => {
  const plantId = parseInt(req.params.plantId);
  await db.delete(wishlistTable)
    .where(and(eq(wishlistTable.userId, req.user!.id), eq(wishlistTable.plantId, plantId)));
  res.status(204).send();
});

export default router;
