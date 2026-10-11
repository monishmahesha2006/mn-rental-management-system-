import { Router } from "express";
import { prisma } from "../../prisma/client";
import { requireAuth } from "../../middleware/auth";
import { loginUser, registerUser } from "./auth.service";
export const authRouter = Router();
authRouter.post("/register", async (_req, res) => {
  return res.status(403).json({
    error: {
      message: "Public registration is disabled. Owner and tenant accounts are provisioned exclusively by the system administrator."
    }
  });
});
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { message: "email and password are required" } });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, name: true }
    });
    if (!user) {
      return res.status(404).json({ error: { message: "User not found" } });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});