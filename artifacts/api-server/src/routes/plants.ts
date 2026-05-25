import { Router } from "express";
import { db } from "@workspace/db";
import { plantsTable } from "@workspace/db";
import { eq, and, gte, lte, like, or, SQL, asc, desc } from "drizzle-orm";
import { fallbackPlants, type FallbackPlant } from "../data/fallbackPlants.js";

const router = Router();

function matchesSearch(plant: FallbackPlant, query: string) {
  const normalizedQuery = query.toLowerCase();
  return [plant.name, plant.category, plant.description]
    .some(value => value.toLowerCase().includes(normalizedQuery));
}

function getFallbackPlants(query: Record<string, unknown>) {
  const {
    category, difficulty, petSafe, lowLight, airPurifier,
    indoor, search, sortBy, minPrice, maxPrice,
  } = query;

  let plants = [...fallbackPlants];

  if (category) plants = plants.filter(plant => plant.category === String(category));
  if (difficulty) plants = plants.filter(plant => plant.difficulty === String(difficulty));
  if (petSafe === "true") plants = plants.filter(plant => plant.petSafe);
  if (indoor !== undefined) plants = plants.filter(plant => plant.indoor === (indoor === "true"));
  if (airPurifier === "true") plants = plants.filter(plant => plant.airPurificationRating >= 4);
  if (lowLight === "true") {
    plants = plants.filter(plant => {
      const value = plant.lightRequirement.toLowerCase();
      return value.includes("low") || value.includes("any");
    });
  }
  if (minPrice) plants = plants.filter(plant => plant.price >= Number(minPrice));
  if (maxPrice) plants = plants.filter(plant => plant.price <= Number(maxPrice));
  if (search) plants = plants.filter(plant => matchesSearch(plant, String(search)));

  if (sortBy === "price_asc") plants.sort((a, b) => a.price - b.price);
  else if (sortBy === "price_desc") plants.sort((a, b) => b.price - a.price);
  else if (sortBy === "popularity") plants.sort((a, b) => b.popularity - a.popularity);
  else if (sortBy === "name") plants.sort((a, b) => a.name.localeCompare(b.name));
  else plants.sort((a, b) => a.id - b.id);

  return plants;
}

router.get("/", async (req, res) => {
  const {
    category, difficulty, petSafe, lowLight, airPurifier,
    indoor, search, sortBy, minPrice, maxPrice,
  } = req.query;

  const conditions: SQL[] = [];

  if (category) conditions.push(eq(plantsTable.category, String(category)));
  if (difficulty) conditions.push(eq(plantsTable.difficulty, String(difficulty)));
  if (petSafe === "true") conditions.push(eq(plantsTable.petSafe, true));
  if (indoor !== undefined) conditions.push(eq(plantsTable.indoor, indoor === "true"));
  if (airPurifier === "true") conditions.push(gte(plantsTable.airPurificationRating, 4));
  if (lowLight === "true") {
    conditions.push(
      or(
        like(plantsTable.lightRequirement, "%low%"),
        like(plantsTable.lightRequirement, "%Low%"),
        like(plantsTable.lightRequirement, "%any%"),
        like(plantsTable.lightRequirement, "%Any%")
      )!
    );
  }
  if (minPrice) conditions.push(gte(plantsTable.price, String(minPrice)));
  if (maxPrice) conditions.push(lte(plantsTable.price, String(maxPrice)));
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        like(plantsTable.name, q),
        like(plantsTable.category, q),
        like(plantsTable.description, q)
      )!
    );
  }

  let query = db.select().from(plantsTable);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  // Sorting
  if (sortBy === "price_asc") query = query.orderBy(asc(plantsTable.price)) as typeof query;
  else if (sortBy === "price_desc") query = query.orderBy(desc(plantsTable.price)) as typeof query;
  else if (sortBy === "popularity") query = query.orderBy(desc(plantsTable.popularity)) as typeof query;
  else if (sortBy === "name") query = query.orderBy(asc(plantsTable.name)) as typeof query;
  else query = query.orderBy(asc(plantsTable.id)) as typeof query;

  try {
    const plants = await query;
    if (plants.length > 0) {
      res.json(plants.map(p => ({
        ...p,
        price: parseFloat(String(p.price)),
        originalPrice: p.originalPrice ? parseFloat(String(p.originalPrice)) : null,
      })));
      return;
    }
  } catch {
    // Fall back to the bundled catalog when the database is unavailable.
  }

  res.json(getFallbackPlants(req.query as Record<string, unknown>));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid ID" }); return; }

  try {
    const [plant] = await db.select().from(plantsTable).where(eq(plantsTable.id, id)).limit(1);
    if (plant) {
      res.json({
        ...plant,
        price: parseFloat(String(plant.price)),
        originalPrice: plant.originalPrice ? parseFloat(String(plant.originalPrice)) : null,
      });
      return;
    }
  } catch {
    // Fall back to the bundled catalog when the database is unavailable.
  }

  const plant = fallbackPlants.find(item => item.id === id);
  if (!plant) { res.status(404).json({ message: "Plant not found" }); return; }
  res.json(plant);
});

export default router;
