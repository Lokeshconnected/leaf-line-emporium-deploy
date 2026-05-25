import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import plantsRouter from "./plants.js";
import cartRouter from "./cart.js";
import ordersRouter from "./orders.js";
import donationsRouter from "./donations.js";
import wishlistRouter from "./wishlist.js";
import openaiRouter from "./openai.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/plants", plantsRouter);
router.use("/cart", cartRouter);
router.use("/orders", ordersRouter);
router.use("/donations", donationsRouter);
router.use("/wishlist", wishlistRouter);
router.use("/openai", openaiRouter);

export default router;
