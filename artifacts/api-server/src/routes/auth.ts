import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const result = RegisterBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const { name, email, password } = result.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ message: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, passwordHash })
    .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email, createdAt: usersTable.createdAt });

  const token = signToken({ id: user.id, name: user.name, email: user.email });
  res.status(201).json({ token, user });
});

router.post("/login", async (req, res) => {
  const result = LoginBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const { email, password } = result.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = signToken({ id: user.id, name: user.name, email: user.email });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = req.user!;
  const [dbUser] = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, createdAt: usersTable.createdAt })
    .from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  if (!dbUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(dbUser);
});

export default router;
