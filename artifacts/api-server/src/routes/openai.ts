import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, plantsTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const AI_MODEL =
  process.env.AI_INTEGRATIONS_OPENAI_MODEL ??
  process.env.OPENROUTER_MODEL ??
  "google/gemma-4-26b-a4b-it:free";
const AI_FALLBACK_MODELS = [
  AI_MODEL,
  "openrouter/free",
  "google/gemma-4-26b-a4b-it:free",
].filter((model, index, allModels) => allModels.indexOf(model) === index);

const STORE_CONTEXT = `You are Leafy, LEAFLINE's AI plant care and shopping assistant.

LEAFLINE website context:
- Main pages: Home, Shop, Plant Detail, Checkout, Orders, Donations, and AI Assistant.
- Signed-in users can use cart, wishlist, orders, donations, and AI Assistant features.
- The shop sells plants and shows details like price, category, difficulty, light requirement, watering frequency, pet safety, humidity, placement, and care instructions.
- If a user asks about products on the website, use the catalog context provided below.
- If a user asks about how to use the website, answer based on the features above.
- If the site does not clearly support something, say you are not seeing evidence of it rather than inventing it.

You help users with:
- Plant care guidance
- Product discovery and comparison on LEAFLINE
- Choosing plants based on light, watering needs, pet safety, and difficulty
- Troubleshooting plant problems
- Explaining how to use LEAFLINE features like cart, wishlist, checkout, orders, donations, and the assistant

Response style:
- Be concise, warm, and practical.
- Give direct answers first, then useful details.
- Use catalog facts when available.
- If asked something outside the available website context, say that clearly.`;

async function buildCatalogContext() {
  const plants = await db.select({
    name: plantsTable.name,
    scientificName: plantsTable.scientificName,
    price: plantsTable.price,
    category: plantsTable.category,
    difficulty: plantsTable.difficulty,
    lightRequirement: plantsTable.lightRequirement,
    wateringFrequency: plantsTable.wateringFrequency,
    petSafe: plantsTable.petSafe,
    humidityRequirement: plantsTable.humidityRequirement,
    recommendedPlacement: plantsTable.recommendedPlacement,
    description: plantsTable.description,
  })
    .from(plantsTable)
    .orderBy(desc(plantsTable.popularity), asc(plantsTable.name))
    .limit(18);

  if (plants.length === 0) {
    return "Catalog context: No plants are currently available in the database.";
  }

  const catalogLines = plants.map((plant) =>
    [
      `${plant.name} (${plant.scientificName})`,
      `price ${plant.price}`,
      `category ${plant.category}`,
      `difficulty ${plant.difficulty}`,
      `light ${plant.lightRequirement}`,
      `watering ${plant.wateringFrequency}`,
      `pet safe ${plant.petSafe ? "yes" : "no"}`,
      `humidity ${plant.humidityRequirement}`,
      `placement ${plant.recommendedPlacement}`,
      `description ${plant.description}`,
    ].join(" | "),
  );

  return `Catalog context:\n${catalogLines.join("\n")}`;
}

router.get("/conversations", requireAuth, async (req, res) => {
  const convs = await db.select()
    .from(conversations)
    .orderBy(desc(conversations.createdAt));
  res.json(convs);
});

router.post("/conversations", requireAuth, async (req, res) => {
  const { title } = req.body;
  const [conv] = await db.insert(conversations)
    .values({ title: title || "New Chat" })
    .returning();
  res.status(201).json(conv);
});

router.get("/conversations/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) {
    res.status(404).json({ message: "Conversation not found" });
    return;
  }
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
  res.json({ ...conv, messages: msgs });
});

router.delete("/conversations/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  await db.delete(conversations).where(eq(conversations.id, id));
  res.status(204).send();
});

router.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const msgs = await db.select().from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  res.json(msgs);
});

router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { content } = req.body;
  if (!content) { res.status(400).json({ message: "content required" }); return; }
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid conversation id" });
    return;
  }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) {
    res.status(404).json({ message: "Conversation not found" });
    return;
  }

  // Save user message
  await db.insert(messages).values({ conversationId: id, role: "user", content });

  // Get conversation history
  const history = await db.select().from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  const catalogContext = await buildCatalogContext();

  const chatMessages = [
    { role: "system" as const, content: `${STORE_CONTEXT}\n\n${catalogContext}` },
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    let lastError: unknown;
    let completion:
      | Awaited<ReturnType<typeof openai.chat.completions.create>>
      | undefined;

    for (const model of AI_FALLBACK_MODELS) {
      try {
        completion = await openai.chat.completions.create({
          model,
          max_tokens: 2048,
          messages: chatMessages,
        });
        break;
      } catch (error) {
        lastError = error;
        const status = typeof error === "object" && error !== null && "status" in error
          ? (error as { status?: number }).status
          : undefined;

        if (status !== 404 && status !== 429) {
          throw error;
        }
      }
    }

    if (!completion) {
      throw lastError instanceof Error
        ? lastError
        : new Error("No AI providers are currently available.");
    }

    fullResponse = completion.choices[0]?.message?.content ?? "";

    if (fullResponse) {
      res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`);
    }

    // Save assistant message
    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });

    // Update conversation updatedAt
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "AI service unavailable";
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

export default router;
